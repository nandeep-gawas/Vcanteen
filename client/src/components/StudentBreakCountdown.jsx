import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentBreakCountdown({ token, userYear }) {
  const [slotData, setSlotData] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch student's specific year slot
  const fetchMySlot = async () => {
    try {
      const res = await fetch('/api/slots/my-slot', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.slot) {
          setSlotData(json.slot);
          setSecondsLeft(json.slot.secondsToTarget);
        }
      }
    } catch (err) {
      console.error('Failed to fetch student slot countdown:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySlot();
  }, [token, userYear]);

  // Real-time ticking timer (decrements every second)
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Re-fetch when timer expires to switch states (e.g. from upcoming -> active)
          fetchMySlot();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Format seconds into HH:MM:SS
  const formatTime = (secs) => {
    if (secs === null || secs <= 0) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!slotData) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Your Year Break Slot</h3>
          <p className="text-xs text-slate-500 mt-1">No custom slot configured for Year {userYear || 'your academic batch'}.</p>
        </div>
        <Link to="/break-slots" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
          View Timetable <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const isLive = slotData.status === 'active';
  const isUpcoming = slotData.status === 'upcoming';
  const isEnded = slotData.status === 'ended';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 shadow-xs ${
        isLive
          ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white border-emerald-400 shadow-emerald-500/20 shadow-lg'
          : isUpcoming
          ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-white text-slate-800 border-orange-200'
          : 'bg-white text-slate-800 border-slate-200/80'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                isLive
                  ? 'bg-white/25 text-white backdrop-blur'
                  : isUpcoming
                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Year {slotData.target_year} Break Schedule</span>
            </span>

            {isLive && (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-white text-emerald-800 px-2.5 py-0.5 rounded-full animate-bounce">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Active Now
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {slotData.slot_name}
          </h2>
          <p className={`text-xs mt-1 ${isLive ? 'text-emerald-100' : 'text-slate-500'}`}>
            Designated Window: <strong className={isLive ? 'text-white' : 'text-slate-700'}>{slotData.start_time} - {slotData.end_time}</strong>
          </p>
        </div>

        {/* Live Countdown Display Box */}
        <div className="text-left sm:text-right">
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLive ? 'text-emerald-100' : 'text-slate-500'}`}>
            {isLive ? 'Break Ends In' : isUpcoming ? 'Countdown to Break' : 'Status'}
          </p>

          {isEnded ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Break Finished Today</span>
            </div>
          ) : (
            <div
              className={`inline-block px-5 py-2.5 rounded-2xl font-mono text-2xl sm:text-3xl font-black tracking-wider shadow-inner ${
                isLive
                  ? 'bg-black/20 text-white border border-white/20'
                  : 'bg-white text-orange-600 border border-orange-200 shadow-xs'
              }`}
            >
              {formatTime(secondsLeft)}
            </div>
          )}
        </div>
      </div>

      {/* 5-Minute Warning Banner */}
      {isUpcoming && secondsLeft !== null && secondsLeft <= 300 && secondsLeft > 0 && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-500 text-white font-bold text-xs flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>🔔 Your break starts in less than 5 minutes! Head to the canteen now to beat the rush.</span>
          </div>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">Gate Opening Soon</span>
        </div>
      )}

      <div className={`mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
        isLive ? 'border-white/20 text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
      }`}>
        <span>
          {isLive
            ? '✅ Turnstiles open for Year ' + slotData.target_year + ' students. Head to the canteen now!'
            : isUpcoming
            ? '⏳ Please wait for your year slot to scan QR code at turnstile.'
            : 'Next slot schedule active tomorrow morning.'}
        </span>
        <Link
          to="/break-slots"
          className={`font-bold inline-flex items-center gap-1 hover:underline ${
            isLive ? 'text-white' : 'text-orange-600 dark:text-orange-400'
          }`}
        >
          View Full Campus Timetable <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
