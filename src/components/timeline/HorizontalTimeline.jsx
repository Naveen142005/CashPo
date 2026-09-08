import React, { useState } from 'react';
import { CheckCircle2, Clock, ArrowRight, ShieldAlert, Sparkles, CircleDot, ChevronRight } from 'lucide-react';
import { formatCurrency, formatFriendlyDate } from '../../services/periodAnalytics';
import { calculateDaysBetween } from '../../services/api';

export default function HorizontalTimeline({ loan, showFullDetails = true }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const isCompleted = loan.status === 'COMPLETED';
  const repayments = loan.repayments || [];
  const principal = Number(loan.principalAmount) || 0;
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate cumulative repayments at each step to show remaining balance
  let runningRepaid = 0;
  const milestoneSteps = repayments.map((rep, index) => {
    runningRepaid += Number(rep.amount) || 0;
    const remainingAfter = Math.max(0, principal - runningRepaid);
    const percentCleared = Math.min(100, Math.round((runningRepaid / principal) * 100));

    return {
      ...rep,
      index,
      runningRepaid,
      remainingAfter,
      percentCleared
    };
  });

  // Calculate current waiting days from last event to today (for active loans)
  const lastEventDate = repayments.length > 0
    ? repayments[repayments.length - 1].date
    : loan.startDate;
  const daysWaitingCurrent = calculateDaysBetween(lastEventDate, todayStr);
  const totalDaysSinceStart = calculateDaysBetween(loan.startDate, todayStr);

  return (
    <div className="w-full">
      {/* Scrollable Timeline Track */}
      <div className="overflow-x-auto no-scrollbar py-3 px-1 -mx-1">
        <div className="inline-flex items-center min-w-full gap-0 pr-6">

          {/* STEP 1: MONEY LENT (ORIGIN) */}
          <div
            onClick={() => setSelectedNode({
              type: 'LENT',
              title: 'Money Lent',
              amount: principal,
              date: loan.startDate,
              note: loan.note,
              gap: 'Day 0 (Start)'
            })}
            className="flex flex-col items-center cursor-pointer group flex-shrink-0"
          >
            <span className="text-[10px] font-mono font-medium text-slate-400 mb-1.5 whitespace-nowrap">
              {formatFriendlyDate(loan.startDate)}
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-emerald-400 font-bold text-xs font-mono">₹</span>
            </div>
            <span className="text-xs font-bold text-slate-100 font-mono mt-1.5 whitespace-nowrap">
              {formatCurrency(principal)}
            </span>
            <span className="text-[10px] text-emerald-400/90 font-semibold uppercase tracking-wider mt-0.5">
              Lent
            </span>
          </div>

          {/* INTERMEDIATE REPAYMENT MILESTONES */}
          {milestoneSteps.map((step, idx) => {
            const gapDays = step.daysSincePrevious !== undefined
              ? step.daysSincePrevious
              : calculateDaysBetween(idx === 0 ? loan.startDate : repayments[idx - 1].date, step.date);

            return (
              <React.Fragment key={step.id || idx}>
                {/* CONNECTOR LINE WITH TIME GAP BADGE */}
                <div className="flex flex-col items-center px-1 flex-shrink-0 min-w-[72px] sm:min-w-[90px]">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-teal-500/30 mb-1 whitespace-nowrap shadow-sm">
                    +{gapDays}d
                  </span>
                  <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                  <span className="text-[9px] text-slate-400 mt-1 whitespace-nowrap font-medium">
                    gap
                  </span>
                </div>

                {/* REPAYMENT NODE */}
                <div
                  onClick={() => setSelectedNode({
                    type: 'REPAY',
                    title: `Repayment #${idx + 1}`,
                    amount: step.amount,
                    date: step.date,
                    note: step.note,
                    gap: `+${gapDays} days after previous event`,
                    remaining: step.remainingAfter,
                    progress: step.percentCleared
                  })}
                  className="flex flex-col items-center cursor-pointer group flex-shrink-0"
                >
                  <span className="text-[10px] font-mono font-medium text-slate-400 mb-1.5 whitespace-nowrap">
                    {formatFriendlyDate(step.date)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-teal-950 border-2 border-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  </div>
                  <span className="text-xs font-bold text-teal-300 font-mono mt-1.5 whitespace-nowrap">
                    +{formatCurrency(step.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-0.5">
                    {step.remainingAfter > 0 ? `Rem: ${formatCurrency(step.remainingAfter)}` : 'Cleared'}
                  </span>
                </div>
              </React.Fragment>
            );
          })}

          {/* FINAL NODE: COMPLETED OR CURRENTLY PENDING */}
          {isCompleted ? (
            /* COMPLETED TERMINAL NODE */
            <React.Fragment>
              <div className="flex flex-col items-center px-1 flex-shrink-0 min-w-[60px]">
                <div className="w-full h-0.5 bg-emerald-500/60 rounded-full" />
              </div>
              <div
                onClick={() => setSelectedNode({
                  type: 'COMPLETED',
                  title: 'Fully Settled',
                  totalDays: loan.totalTurnaroundDays,
                  date: loan.completedDate || lastEventDate,
                  amount: principal
                })}
                className="flex flex-col items-center cursor-pointer group flex-shrink-0"
              >
                <span className="text-[10px] font-mono font-medium text-emerald-400 mb-1.5 whitespace-nowrap">
                  {formatFriendlyDate(loan.completedDate || lastEventDate)}
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono mt-1.5 whitespace-nowrap">
                  Closed ✓
                </span>
                <span className="text-[10px] text-emerald-300/80 font-bold font-mono mt-0.5 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {loan.totalTurnaroundDays || calculateDaysBetween(loan.startDate, loan.completedDate || lastEventDate)}d total
                </span>
              </div>
            </React.Fragment>
          ) : (
            /* ACTIVE WAITING / PENDING TERMINAL NODE */
            <React.Fragment>
              <div className="flex flex-col items-center px-1 flex-shrink-0 min-w-[70px] sm:min-w-[84px]">
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-1 whitespace-nowrap animate-pulse">
                  +{daysWaitingCurrent}d
                </span>
                <div className="w-full h-0.5 border-t-2 border-dashed border-amber-500/50" />
                <span className="text-[9px] text-amber-400/80 mt-1 whitespace-nowrap font-medium">
                  waiting
                </span>
              </div>

              <div className="flex flex-col items-center flex-shrink-0">
                <span className="text-[10px] font-mono font-medium text-amber-400/80 mb-1.5 whitespace-nowrap">
                  Current
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-950/50 border-2 border-amber-400/70 border-dashed flex items-center justify-center shadow-lg shadow-amber-500/10 animate-pulse">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono mt-1.5 whitespace-nowrap">
                  {formatCurrency(loan.pendingAmount)}
                </span>
                <span className="text-[10px] text-amber-300/80 font-semibold uppercase tracking-wider mt-0.5">
                  Pending
                </span>
              </div>
            </React.Fragment>
          )}

        </div>
      </div>

      {/* Tapped Node Micro-Inspector Box (Helpful on touch screens) */}
      {selectedNode && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs flex items-center justify-between animate-fadeIn">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-200">{selectedNode.title}:</span>
              <span className="font-mono font-bold text-emerald-400">{formatCurrency(selectedNode.amount)}</span>
              <span className="text-slate-400 font-mono">({formatFriendlyDate(selectedNode.date)})</span>
            </div>
            {selectedNode.note && (
              <p className="text-[11px] text-slate-300 mt-0.5 italic">"{selectedNode.note}"</p>
            )}
            {selectedNode.gap && (
              <p className="text-[10px] text-teal-400 font-mono mt-0.5">{selectedNode.gap}</p>
            )}
            {selectedNode.totalDays !== undefined && (
              <p className="text-[10px] text-emerald-300 font-mono mt-0.5">
                Total turnaround time: {selectedNode.totalDays} days from lending to final payment.
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800 rounded-lg ml-2"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
