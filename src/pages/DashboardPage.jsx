import React from 'react';
import {
  Zap,
  Hourglass,
  Clock,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  ShieldCheck,
  Activity,
  Layers,
  BarChart2,
  PieChart,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatFriendlyDate, formatMonthYear } from '../services/periodAnalytics';

export default function DashboardPage({ analytics }) {
  if (!analytics) return null;

  const {
    totalLent,
    totalRepaid,
    totalPending,
    totalLoansCount,
    activeCount,
    completedCount,
    totalInstallmentsLogged,
    averageInstallmentsPerLoan,
    recoveryRate,
    averageLoanAmount,
    fastestSettle,
    longestSettle,
    averageSettleDays,
    speedBuckets,
    currentInactivityGapDays,
    longestInactivityGapDays,
    longestInactivityDates,
    mostRecentDate,
    allGapsLedger,
    activeAging,
    monthlyMatrix,
    mostFrequentDayName
  } = analytics;

  const totalCompleted = completedCount || 1;
  const fastPercent = Math.round(((speedBuckets?.fast || 0) / totalCompleted) * 100);
  const modPercent = Math.round(((speedBuckets?.moderate || 0) / totalCompleted) * 100);
  const slowPercent = Math.round(((speedBuckets?.slow || 0) / totalCompleted) * 100);

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Top Banner: Financial Ledger Totals & Volume Grid */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Period & Financial Analytics</h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
            {recoveryRate}% Recovered
          </span>
        </div>

        {/* 3 Main Amount Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Total Lent
            </span>
            <span className="text-sm sm:text-base font-extrabold font-mono text-slate-200 mt-1 block">
              {formatCurrency(totalLent)}
            </span>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
              {totalLoansCount} loans total
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-teal-400/90 font-semibold uppercase tracking-wider block">
              Total Repaid
            </span>
            <span className="text-sm sm:text-base font-extrabold font-mono text-teal-300 mt-1 block">
              {formatCurrency(totalRepaid)}
            </span>
            <span className="text-[9px] text-teal-400/80 font-mono mt-0.5 block">
              {completedCount} cleared
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-amber-400/90 font-semibold uppercase tracking-wider block">
              Net Pending
            </span>
            <span className={`text-sm sm:text-base font-extrabold font-mono mt-1 block ${totalPending > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatCurrency(totalPending)}
            </span>
            <span className="text-[9px] text-amber-400/80 font-mono mt-0.5 block">
              {activeCount} active
            </span>
          </div>
        </div>

        {/* 3 Secondary Metric Badges */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
          <div className="p-2 bg-slate-900/40 rounded-lg">
            <span className="text-[9px] text-slate-400 uppercase font-medium block">Avg Loan Ticket</span>
            <span className="font-bold font-mono text-slate-200 mt-0.5 block">{formatCurrency(averageLoanAmount)}</span>
          </div>
          <div className="p-2 bg-slate-900/40 rounded-lg">
            <span className="text-[9px] text-slate-400 uppercase font-medium block">Installments Logged</span>
            <span className="font-bold font-mono text-teal-300 mt-0.5 block">{totalInstallmentsLogged} times</span>
          </div>
          <div className="p-2 bg-slate-900/40 rounded-lg">
            <span className="text-[9px] text-slate-400 uppercase font-medium block">Avg Installments</span>
            <span className="font-bold font-mono text-emerald-400 mt-0.5 block">{averageInstallmentsPerLoan} / loan</span>
          </div>
        </div>
      </div>

      {/* 2. SECTION: TURNAROUND SPEED & REPAYMENT STREAKS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Turnaround Time (TAT) Records</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Repayment Speed</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* FASTEST SETTLE STREAK */}
          <div className="glass-card rounded-2xl p-4 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/90 relative overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-300/80 uppercase tracking-wider block">
              Shortest Streak
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {fastestSettle ? `${fastestSettle.days}d` : '—'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">fastest</span>
            </div>
            {fastestSettle ? (
              <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">
                {formatCurrency(fastestSettle.loan.principalAmount)} &bull; {formatFriendlyDate(fastestSettle.loan.startDate)}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-2">No completed loans yet</p>
            )}
          </div>

          {/* LONGEST SETTLE STREAK */}
          <div className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-slate-900/90 relative overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 border border-amber-500/30">
              <Hourglass className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-amber-300/80 uppercase tracking-wider block">
              Longest Streak
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black font-mono text-amber-400">
                {longestSettle ? `${longestSettle.days}d` : '—'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">longest</span>
            </div>
            {longestSettle ? (
              <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">
                {formatCurrency(longestSettle.loan.principalAmount)} &bull; {formatFriendlyDate(longestSettle.loan.startDate)}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-2">No completed loans yet</p>
            )}
          </div>
        </div>

        {/* AVERAGE SETTLE TIME */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Average Repayment Period</span>
              <span className="text-[11px] text-slate-400">Mean time taken across completed loans</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold font-mono text-teal-300">
              {averageSettleDays > 0 ? `${averageSettleDays} Days` : 'N/A'}
            </span>
          </div>
        </div>

        {/* SPEED DISTRIBUTION BREAKDOWN (Buckets) */}
        {completedCount > 0 && (
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Repayment Velocity Distribution</span>
              </span>
              <span className="text-slate-400 text-[11px]">{completedCount} closed loans</span>
            </div>

            {/* Visual multi-segmented bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full flex overflow-hidden">
              <div style={{ width: `${fastPercent}%` }} className="bg-emerald-400 h-full" title="Fast (<= 3d)" />
              <div style={{ width: `${modPercent}%` }} className="bg-teal-400 h-full" title="Normal (4-14d)" />
              <div style={{ width: `${slowPercent}%` }} className="bg-amber-400 h-full" title="Slow (> 14d)" />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-400">0–3d: <strong className="text-slate-200">{speedBuckets?.fast || 0}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="text-slate-400">4–14d: <strong className="text-slate-200">{speedBuckets?.moderate || 0}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-400">15+d: <strong className="text-slate-200">{speedBuckets?.slow || 0}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. SECTION: THE TRANSACTION GAPS (CALM PERIODS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>Transaction Gaps (Inactivity Periods)</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Peace Days</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
          {/* Current Inactivity Gap */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Current Transaction Gap</span>
              <span className="text-[11px] text-slate-400">Days since last financial exchange ({formatFriendlyDate(mostRecentDate)})</span>
            </div>
            <span className="text-lg font-bold font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/30">
              {currentInactivityGapDays} Days
            </span>
          </div>

          {/* Longest Historical Peace Gap */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Longest Historical Gap</span>
              <span className="text-[11px] text-slate-400">
                {longestInactivityDates
                  ? `Between ${formatFriendlyDate(longestInactivityDates.from)} and ${formatFriendlyDate(longestInactivityDates.to)}`
                  : 'Calculated across all historical loans'}
              </span>
            </div>
            <span className="text-lg font-bold font-mono text-slate-300 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
              {longestInactivityGapDays} Days
            </span>
          </div>

          {/* Top Historical Gaps Table */}
          {allGapsLedger && allGapsLedger.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
                Top Quiet Intervals (No Transactions)
              </span>
              <div className="space-y-1.5">
                {allGapsLedger.slice(0, 3).map((gap, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] p-2 bg-slate-900/60 rounded-lg font-mono">
                    <span className="text-slate-300">
                      {formatFriendlyDate(gap.fromDate)} &rarr; {formatFriendlyDate(gap.toDate)}
                    </span>
                    <span className="font-bold text-teal-400">+{gap.gapDays} days peace</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. SECTION: MONTHLY PERFORMANCE MATRIX TABLE (Deep Content) */}
      {monthlyMatrix && monthlyMatrix.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Monthly Volume Matrix</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Month Breakdown</span>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-900/60">
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 text-right">Lent</th>
                    <th className="py-2.5 px-3 text-right">Repaid</th>
                    <th className="py-2.5 px-3 text-center">Settled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {monthlyMatrix.map((m) => (
                    <tr key={m.yearMonth} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{m.label}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300 font-bold">{formatCurrency(m.totalLent)}</td>
                      <td className="py-2.5 px-3 text-right text-teal-300 font-bold">{formatCurrency(m.totalRepaid)}</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400">{m.settledCount} closed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SECTION: FRIEND'S BORROWING HABITS */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-200 block">Peak Borrowing Day</span>
          <span className="text-[11px] text-slate-400">Pothi initiates requests most frequently on</span>
        </div>
        <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/30">
          {mostFrequentDayName}s
        </span>
      </div>

    </div>
  );
}
