import React from 'react';
import { ShieldCheck, RefreshCw, Sparkles, User, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../services/periodAnalytics';

export default function Header({ totalPending, onRefresh, isRefreshing, onOpenLend }) {
  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo and Peer Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0b101c] rounded-[11px] flex items-center justify-center">
              <span className="font-extrabold text-emerald-400 text-base font-mono tracking-tighter">CP</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-slate-100 text-lg leading-tight tracking-tight">CashPO</h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                1:1 Ledger
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Naveen . Pothi</p>
          </div>
        </div>

        {/* Action / Pending Pill & Refresh */}
        <div className="flex items-center gap-2">
          {/* Quick Net Pending badge */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Pothi Owes</span>
            <span className={`text-sm font-bold font-mono tracking-tight ${totalPending > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatCurrency(totalPending)}
            </span>
          </div>

          {/* Sync / Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-center text-slate-300 transition-all active:scale-95 disabled:opacity-50"
            title="Sync with MockAPI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
