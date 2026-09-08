import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity,
  Zap,
  Calculator,
  Plus
} from 'lucide-react';
import LoanCard from '../components/cards/LoanCard';
import { formatCurrency, formatFriendlyDate } from '../services/periodAnalytics';

export default function ActiveLoansPage({
  loans = [],
  analytics,
  onOpenLend,
  onOpenRepay,
  onDeleteLoan
}) {
  const activeLoans = loans.filter(l => l.status !== 'COMPLETED');
  const [simulatorAmount, setSimulatorAmount] = useState(500);

  const totalPending = analytics?.totalPending || 0;
  const simulatedRemaining = Math.max(0, totalPending - simulatorAmount);

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Quick Action Hub: The Two Prominent Input Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* BUTTON 1: LEND MONEY */}
        <button
          onClick={onOpenLend}
          className="h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 p-3 flex items-center justify-between shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all border border-emerald-400/30 group"
        >
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950/80 block">Give Money</span>
            <span className="text-base font-extrabold text-slate-950 tracking-tight leading-tight block">
              + Lend Money
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-950/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <ArrowUpRight className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
        </button>

        {/* BUTTON 2: RECORD REPAYMENT */}
        <button
          onClick={() => onOpenRepay(null)}
          disabled={activeLoans.length === 0}
          className="h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 hover:bg-slate-800 text-slate-100 p-3 flex items-center justify-between shadow-lg border border-slate-700/70 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">Pothi Returns</span>
            <span className="text-base font-extrabold text-slate-100 tracking-tight leading-tight block">
              + Add Repay
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
            <ArrowDownLeft className="w-5 h-5 text-teal-400 stroke-[2.5]" />
          </div>
        </button>
      </div>

      {/* 2. Comprehensive Active Intelligence Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Debt to Recover
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                {formatCurrency(totalPending)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                in {activeLoans.length} active {activeLoans.length === 1 ? 'loan' : 'loans'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Transaction Gap
            </span>
            <span className="text-sm font-bold font-mono text-teal-300 mt-0.5 block bg-teal-950/40 px-2.5 py-0.5 rounded-lg border border-teal-500/20">
              {analytics?.currentInactivityGapDays || 0}d calm
            </span>
          </div>
        </div>

        {/* 3 Metrics Mini Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Pothi's Avg TAT</span>
            <span className="text-xs font-bold font-mono text-emerald-400 block mt-0.5">
              {analytics?.averageSettleDays || 0} days
            </span>
          </div>
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Oldest Waiting</span>
            <span className="text-xs font-bold font-mono text-amber-400 block mt-0.5">
              {analytics?.activeAging && analytics.activeAging[0] ? `${analytics.activeAging[0].daysWaiting}d` : '0d'}
            </span>
          </div>
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Recovery Rate</span>
            <span className="text-xs font-bold font-mono text-teal-300 block mt-0.5">
              {analytics?.recoveryRate || 100}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Quick Repayment Simulator (Rich Interactive Content) */}
      {totalPending > 0 && (
        <div className="glass-card rounded-2xl p-3.5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-teal-400" />
              <span>Repayment Simulator</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              If Pothi pays <strong className="text-teal-300 font-bold">{formatCurrency(simulatorAmount)}</strong>
            </span>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[200, 500, 1000, 2000, totalPending].filter((val, i, arr) => arr.indexOf(val) === i && val <= totalPending).map((val) => (
              <button
                key={val}
                onClick={() => setSimulatorAmount(val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex-shrink-0 border ${
                  simulatorAmount === val
                    ? 'bg-teal-500 text-slate-950 font-bold border-teal-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {val === totalPending ? 'Full Settle' : formatCurrency(val)}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] bg-slate-900/70 p-2 rounded-xl border border-slate-800 font-mono">
            <span className="text-slate-400">Projected Remaining Debt:</span>
            <span className={`font-bold text-sm ${simulatedRemaining === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {formatCurrency(simulatedRemaining)} {simulatedRemaining === 0 ? '✓ (Fully Cleared)' : ''}
            </span>
          </div>
        </div>
      )}

      {/* 4. Active Loans & Timelines Section */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Ongoing Loans & Timelines ({activeLoans.length})</span>
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">Auto-archives when ₹0</span>
      </div>

      {activeLoans.length === 0 ? (
        /* Zero Debt State */
        <div className="glass-card rounded-2xl p-8 text-center border border-slate-800/80 my-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">All Cleared & Settled!</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
            Pothi currently has zero pending debt. All past loans have been moved to the Timelines archive.
          </p>
          <button
            onClick={onOpenLend}
            className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Lend Money to Pothi</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeLoans.map(loan => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onOpenRepay={(selected) => onOpenRepay(selected)}
              onDelete={onDeleteLoan}
            />
          ))}
        </div>
      )}

      {/* 5. Recent Activity Ticker Stream (Rich Content) */}
      {analytics?.recentActivityFeed && analytics.recentActivityFeed.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Recent Transaction Ticker</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Latest activity</span>
          </div>

          <div className="glass-card rounded-2xl p-3 border border-slate-800 space-y-2">
            {analytics.recentActivityFeed.slice(0, 4).map((ev, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                    ev.type === 'LEND'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                  }`}>
                    {ev.type === 'LEND' ? '↑' : '↓'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">
                      {ev.type === 'LEND' ? 'Lent to Pothi' : 'Repayment from Pothi'}
                    </span>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px] sm:max-w-xs">
                      {ev.note} &bull; {formatFriendlyDate(ev.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold ${ev.type === 'LEND' ? 'text-slate-200' : 'text-teal-300'}`}>
                    {ev.type === 'LEND' ? formatCurrency(ev.amount) : `+${formatCurrency(ev.amount)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
