import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  Camera,
  CameraOff,
  Users,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Volume2,
  VolumeX,
  History,
  RotateCcw,
  UserCheck,
  LogOut,
  LogIn
} from 'lucide-react';
import LiveOccupancyMeter from '../components/LiveOccupancyMeter';

export default function GateScanner() {
  const { user, token } = useAuth();

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scan result state
  const [lastResult, setLastResult] = useState(null);
  const [alertData, setAlertData] = useState(null); // CANTEEN_FULL or OUTSIDE_SLOT
  const [logs, setLogs] = useState([]);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'reader-viewport';

  // Synthesize audio feedback (no external assets needed)
  const playSound = (type = 'success') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'exit') {
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime); // G5
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.1); // C5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        // Error / Alert buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      // AudioContext not allowed or unsupported
    }
  };

  // Fetch recent scan logs
  const fetchRecentLogs = async () => {
    try {
      const res = await fetch('/api/gate/recent-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch recent logs:', err);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, [token]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    try {
      const qrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrCode;

      await qrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // Frame scan error - ignore to keep scanning smoothly
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Error starting html5-qrcode:', err);
      setCameraError('Unable to access webcam. Please check browser permissions or use manual ID entry below.');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
    }
    setIsScanning(false);
  };

  // Process student scan via API
  const handleScan = async (rollNo, override = false) => {
    if (processing) return;
    setProcessing(true);
    setAlertData(null);

    try {
      const res = await fetch('/api/gate/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ roll_no: rollNo, override })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setLastResult(json);
        playSound(json.action === 'ENTRY' ? 'success' : 'exit');
        fetchRecentLogs();
        setManualInput('');
      } else {
        playSound('error');
        setAlertData({
          rollNo,
          code: json.code,
          title: json.title || 'SCAN REJECTED',
          message: json.message,
          student: json.student,
          slot: json.slot,
          requiresOverride: json.requiresOverride
        });
      }
    } catch (err) {
      playSound('error');
      setAlertData({
        rollNo,
        code: 'NETWORK_ERROR',
        title: 'CONNECTION ERROR',
        message: 'Unable to connect to VCanteen Gate verification server.'
      });
    } finally {
      setTimeout(() => setProcessing(false), 1200);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScan(manualInput.trim());
  };

  const handleOverride = () => {
    if (!alertData?.rollNo) return;
    const roll = alertData.rollNo;
    setAlertData(null);
    handleScan(roll, true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Turnstile Gate Scanner
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Staff Station
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time QR barcode verification with automated Entry/Exit toggling and capacity limiter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title="Audio feedback"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Chime Muted'}</span>
          </button>
        </div>
      </div>

      {/* Live Occupancy Meter */}
      <LiveOccupancyMeter />

      {/* BIG RED ALERT: CANTEEN FULL or OUTSIDE SLOT */}
      {alertData && (
        <div className="animate-in zoom-in-95 duration-200 rounded-3xl p-6 sm:p-8 bg-red-600 text-white shadow-2xl shadow-red-600/30 border-4 border-red-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <AlertOctagon className="w-10 h-10 text-white animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-red-200 bg-red-800/60 px-3 py-1 rounded-full">
                  GATE ACCESS DENIED
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1.5">
                  {alertData.title}
                </h2>
                <p className="mt-2 text-sm text-red-100 font-medium max-w-2xl leading-relaxed">
                  {alertData.message}
                </p>

                {alertData.student && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/25 text-xs text-white">
                    <span>Student: <strong>{alertData.student.name}</strong></span>
                    <span>• Roll: <strong className="font-mono uppercase">{alertData.student.roll_no}</strong></span>
                    {alertData.student.year && (
                      <span>• Year: <strong>{alertData.student.year}</strong></span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {alertData.requiresOverride && (
                <button
                  onClick={handleOverride}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Staff Override (Allow Entry)
                </button>
              )}
              <button
                onClick={() => setAlertData(null)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-black/30 hover:bg-black/40 text-white font-bold text-xs uppercase tracking-wider transition text-center"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Camera & QR Viewport */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-orange-500" />
                Live Camera QR Scanner
              </span>

              {isScanning ? (
                <button
                  onClick={stopCamera}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition border border-red-200"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  Stop Camera
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Launch Scanner
                </button>
              )}
            </div>

            {/* Video Viewport Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[290px] flex items-center justify-center text-center p-4">
              <div id={scannerContainerId} className="w-full max-w-xs mx-auto overflow-hidden rounded-xl"></div>

              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-slate-400 bg-slate-900/90">
                  <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-slate-300 mb-3 border border-slate-700">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Camera is Inactive</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Click "Launch Scanner" to activate your webcam, or use the quick roll number buttons below.
                  </p>
                  <button
                    onClick={startCamera}
                    className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Start Camera
                  </button>
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-xl border border-amber-200 font-medium">
                {cameraError}
              </p>
            )}
          </div>

          {/* Quick Demo Roll Number Buttons (for testing without camera) */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Instant Simulation (Click to scan student):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleScan('student1')}
                disabled={processing}
                className="p-2 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition text-left"
              >
                <span className="font-bold text-slate-800 block">Aarav (Yr 3)</span>
                <span className="text-[10px] text-slate-400 font-mono">student1</span>
              </button>

              <button
                type="button"
                onClick={() => handleScan('student2')}
                disabled={processing}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition text-left"
              >
                <span className="font-bold text-slate-800 block">Priya (Yr 2)</span>
                <span className="text-[10px] text-slate-400 font-mono">student2</span>
              </button>

              <button
                type="button"
                onClick={() => handleScan('student3')}
                disabled={processing}
                className="p-2 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
              >
                <span className="font-bold text-slate-800 block">Neha (Yr 1)</span>
                <span className="text-[10px] text-slate-400 font-mono">student3</span>
              </button>

              <button
                type="button"
                onClick={() => handleScan('student4')}
                disabled={processing}
                className="p-2 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition text-left"
              >
                <span className="font-bold text-slate-800 block">Vikram (Yr 4)</span>
                <span className="text-[10px] text-slate-400 font-mono">student4</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Manual Barcode / Roll Entry & Scan Feedback */}
        <div className="lg:col-span-5 space-y-5">
          {/* Manual Input Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Manual Roll / Barcode Input
            </span>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Enter student ID (e.g. student1)"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={processing || !manualInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Process Gate Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Last Result Card */}
          {lastResult && (
            <div className={`rounded-3xl p-6 border transition-all animate-in fade-in duration-200 ${
              lastResult.action === 'ENTRY'
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-indigo-50 border-indigo-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  lastResult.action === 'ENTRY'
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-indigo-200 text-indigo-900'
                }`}>
                  {lastResult.action === 'ENTRY' ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                  {lastResult.action === 'ENTRY' ? 'ENTRY RECORDED' : 'EXIT RECORDED'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mt-2">
                {lastResult.student.name}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Roll: <strong className="font-mono">{lastResult.student.roll_no.toUpperCase()}</strong> • Year {lastResult.student.year || 'N/A'} • {lastResult.student.branch || 'Campus'}
              </p>

              <div className="mt-3 p-3 bg-white/80 rounded-xl text-xs font-semibold text-slate-800">
                {lastResult.message}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Updated Canteen Occupancy:</span>
                <strong className="text-sm font-bold text-slate-900">
                  {lastResult.currentInside} / {lastResult.maxCapacity} Inside
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Log Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-orange-500" />
            Today's Turnstile Activity Log
          </h2>
          <button
            onClick={fetchRecentLogs}
            className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No gate scans recorded yet today.</p>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-wider pb-2">
                  <th className="py-2">Type</th>
                  <th className="py-2">Student Name</th>
                  <th className="py-2">Roll No</th>
                  <th className="py-2">Year</th>
                  <th className="py-2">Notes</th>
                  <th className="py-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        log.entry_type === 'in'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {log.entry_type === 'in' ? 'ENTRY' : 'EXIT'}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-slate-800">{log.student_name}</td>
                    <td className="py-2.5 font-mono text-slate-500 uppercase">{log.roll_no}</td>
                    <td className="py-2.5 text-slate-600">Year {log.year || '-'}</td>
                    <td className="py-2.5 text-slate-500">{log.notes || '-'}</td>
                    <td className="py-2.5 text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
