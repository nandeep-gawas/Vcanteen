import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  UtensilsCrossed,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

export default function StudentQRPassModal({ student, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !student) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(student.roll_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Pass Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-100">
              VCanteen Digital Pass
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight">{student.name}</h2>
          <p className="text-xs text-orange-100 mt-0.5">
            {student.branch || 'Student'} • Year {student.year || 'N/A'}
          </p>
        </div>

        {/* Pass Body / QR Section */}
        <div className="p-6 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-orange-800 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            Scan at Turnstile Gate
          </div>

          {/* QR Code Frame */}
          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-inner inline-block hover:border-orange-500 transition">
            <QRCodeSVG
              value={student.roll_no}
              size={180}
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#0F172A"
            />
          </div>

          {/* Student Roll / ID Badge */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="font-mono text-sm font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800">
              {student.roll_no.toUpperCase()}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Copy ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 max-w-xs leading-relaxed">
            Hold this QR code directly in front of the gate scanner camera. First scan records <strong>ENTRY</strong>, next scan records <strong>EXIT</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">Valid for Academic Year 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
