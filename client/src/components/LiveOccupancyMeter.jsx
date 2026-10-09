import React, { useState, useEffect } from 'react';
import { Activity, Users, AlertOctagon, Sparkles } from 'lucide-react';

export default function LiveOccupancyMeter({ onOccupancyChange }) {
  const [data, setData] = useState({
    currentInside: 0,
    maxCapacity: 100,
    occupancyRate: 0,
    crowdLevel: 'low',
    isFull: false
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchOccupancy = async () => {
    try {
      const res = await fetch('/api/gate/occupancy');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
        if (onOccupancyChange) {
          onOccupancyChange(json);
        }
      }
    } catch (err) {
      console.error('Failed to poll occupancy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupancy();
    // 5-second auto-refresh as required
    const interval = setInterval(fetchOccupancy, 5000);
    return () => clearInterval(interval);
  }, []);

  // Determine meter styling based on occupancy
  const getMeterColor = () => {
    if (data.isFull || data.occupancyRate >= 95) {
      return {
        bar: 'bg-red-600',
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        status: 'Canteen Full',
        sub: 'Expect entrance delays. Students currently inside must exit first.'
      };
    }
    if (data.occupancyRate >= 80) {
      return {
        bar: 'bg-gradient-to-r from-amber-500 to-red-500',
        text: 'text-red-600',
        bg: 'bg-red-50/60',
        border: 'border-red-200/60',
        status: 'Heavy Rush',
        sub: 'High dining hall load. Peak lunch queue times.'
      };
    }
    if (data.occupancyRate >= 50) {
      return {
        bar: 'bg-gradient-to-r from-emerald-500 to-amber-500',
        text: 'text-amber-700',
        bg: 'bg-amber-50/60',
        border: 'border-amber-200/60',
        status: 'Moderate Traffic',
        sub: 'Normal flow with brief counter wait times.'
      };
    }
    return {
      bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200/60',
      status: 'Low Crowd',
      sub: 'Plenty of seating. Ideal time to grab a hot meal!'
    };
  };

  const style = getMeterColor();

  return (
    <div className={`rounded-3xl p-5 border ${style.border} ${style.bg} dark:bg-slate-900/90 dark:border-slate-800 transition-all duration-300 shadow-xs`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-300">
            <Activity className="w-5 h-5 animate-pulse text-orange-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Canteen Occupancy</h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border bg-white dark:bg-slate-800 ${style.text} ${style.border}`}>
                {style.status} ({data.occupancyRate}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {style.sub}
            </p>
          </div>
        </div>

        {/* Live Indicator Chip */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live (5s Refresh)</span>
          </div>
          <div className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-right">
            <span className="text-[10px] text-slate-400 block leading-none">Inside</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
              {data.currentInside} <span className="text-xs font-normal text-slate-400">/ {data.maxCapacity}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/80 dark:bg-slate-800 rounded-full h-3.5 p-0.5 border border-slate-200/60 dark:border-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
          style={{ width: `${Math.min(100, Math.max(2, data.occupancyRate))}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
        <span>0 (Empty)</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Capacity Limit: {data.maxCapacity} seats
        </span>
        <span>{data.maxCapacity} (Max)</span>
      </div>
    </div>
  );
}
