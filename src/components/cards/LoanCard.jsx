import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  Trash2,
  Calendar,
  FileText,
  Share2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import HorizontalTimeline from '../timeline/HorizontalTimeline';
import { formatCurrency, formatFriendlyDate } from '../../services/periodAnalytics';
import { calculateDaysBetween } from '../../services/api';

export default function LoanCard({ loan, onOpenRepay, onDelete }) {
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const principal = Number(loan.principalAmount) || 0;
  const repaid = Number(loan.totalRepaid) || 0;
  const pending = Number(loan.pendingAmount) || 0;
  const percentRepaid = Math.min(100, Math.round((repaid / principal) * 100));
  const isCompleted = loan.status === 'COMPLETED';
  const isPartial = loan.status === 'PARTIAL_PAID';

  const todayStr = new Date().toISOString().split('T')[0];
  const daysActive = calculateDaysBetween(loan.startDate, isCompleted ? (loan.completedDate || todayStr) : todayStr);

  const repayments = loan.repayments || [];

  // Share / Copy WhatsApp summary
  const handleShare = () => {
    let text = `*CashPO Ledger - Loan #${loan.id}*\n`;
    text += `• Lent: ₹${principal.toLocaleString('en-IN')} on ${formatFriendlyDate(loan.startDate)}\n`;
    if (loan.note) text += `• Purpose: ${loan.note}\n`;
    text += `• Total Repaid: ₹${repaid.toLocaleString('en-IN')}\n`;
    text += `• Pending Balance: ₹${pending.toLocaleString('en-IN')}\n`;
    text += `• Status: ${loan.status} (${isCompleted ? `Settled in ${loan.totalTurnaroundDays || daysActive}d` : `Active for ${daysActive}d`})\n`;

    if (repayments.length > 0) {
      text += `\n*Repayments Log:*\n`;
      repayments.forEach((r, idx) => {
        text += `${idx + 1}. ₹${Number(r.amount).toLocaleString('en-IN')} on ${formatFriendlyDate(r.date)} (+${r.daysSincePrevious || 0}d)\n`;
      });
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }

    // Attempt WhatsApp intent
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-xl relative overflow-hidden border border-slate-700/60 hover:border-slate-600/80">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isCompleted
          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
          : isPartial
          ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
          : 'bg-gradient-to-r from-amber-500 to-orange-500'
      }`} />

      {/* Top Meta Bar */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-300 tracking-wider uppercase bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
              Loan #{loan.id}
            </span>
            {loan.note && (
              <span className="text-xs font-medium text-slate-300 truncate max-w-[180px] sm:max-w-xs">
                &bull; {loan.note}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Lent on {formatFriendlyDate(loan.startDate)}</span>
            <span>&bull;</span>
            <span className="font-mono text-teal-400/90 font-semibold">
              {isCompleted ? `Settled in ${loan.totalTurnaroundDays || daysActive}d` : `Active for ${daysActive}d`}
            </span>
          </div>
        </div>

        {/* Status Badge & Share */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-700/60 flex items-center justify-center transition-all"
            title="Share timeline summary to WhatsApp"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              COMPLETED
            </span>
          ) : isPartial ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-teal-500/10 text-teal-300 border border-teal-500/30">
              <Clock className="w-3.5 h-3.5" />
              PARTIAL PAID
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              PENDING
            </span>
          )}
        </div>
      </div>

      {/* Amounts Summary Row */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/80 rounded-xl p-2.5 mb-3 border border-slate-800/90">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Principal</span>
          <span className="text-sm sm:text-base font-bold font-mono text-slate-200">
            {formatCurrency(principal)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-teal-400/90 font-semibold uppercase tracking-wider block">Repaid</span>
          <span className="text-sm sm:text-base font-bold font-mono text-teal-300">
            {formatCurrency(repaid)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-amber-400/90 font-semibold uppercase tracking-wider block">Pending</span>
          <span className={`text-sm sm:text-base font-bold font-mono ${pending > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {formatCurrency(pending)}
          </span>
        </div>
      </div>

      {/* Repayment Progress Track */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
          <span className="text-slate-400 font-medium">Repayment Velocity</span>
          <span className="text-emerald-400 font-bold">{percentRepaid}% Cleared</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isCompleted
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${percentRepaid}%` }}
          />
        </div>
      </div>

      {/* The Interactive Horizontal Timeline */}
      <div className="bg-[#0b101c]/90 rounded-xl p-3 border border-slate-800/80 mb-3">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Horizontal Milestone Journey</span>
          <span className="text-[10px] font-mono text-slate-400 lowercase">swipe track →</span>
        </div>
        <HorizontalTimeline loan={loan} />
      </div>

      {/* Collapsible Detailed Installments Ledger Table */}
      <div className="mb-3">
        <button
          onClick={() => setIsTableExpanded(!isTableExpanded)}
          className="w-full py-1.5 px-3 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-slate-300 text-xs font-semibold flex items-center justify-between border border-slate-800 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-teal-400" />
            <span>Installment Log ({repayments.length} payments)</span>
          </span>
          {isTableExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {isTableExpanded && (
          <div className="mt-2 rounded-xl bg-slate-950/80 border border-slate-800/90 overflow-hidden text-xs animate-fadeIn">
            {repayments.length === 0 ? (
              <div className="p-3 text-center text-slate-400 text-[11px]">
                No repayments recorded yet. Loan is fully pending.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-900/40">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-center">Gap</th>
                      <th className="py-2 px-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {repayments.map((rep, idx) => (
                      <tr key={rep.id || idx} className="hover:bg-slate-900/30 text-[11px]">
                        <td className="py-2 px-3 text-slate-400">#{idx + 1}</td>
                        <td className="py-2 px-3 text-slate-300">{formatFriendlyDate(rep.date)}</td>
                        <td className="py-2 px-3 text-right font-bold text-teal-300">{formatCurrency(rep.amount)}</td>
                        <td className="py-2 px-3 text-center text-teal-400/90">+{rep.daysSincePrevious || 0}d</td>
                        <td className="py-2 px-3 text-slate-400 font-sans truncate max-w-[120px]">{rep.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {!isCompleted ? (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onOpenRepay(loan)}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Add Repayment (₹{pending.toLocaleString('en-IN')} pending)</span>
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(loan.id)}
              className="w-11 h-11 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700/60 flex items-center justify-center transition-colors active:scale-95"
              title="Delete loan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between pt-1 text-xs text-slate-400 border-t border-slate-800/60 mt-1">
          <span className="text-emerald-400 font-medium font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Closed in {loan.totalTurnaroundDays || daysActive} days ({repayments.length} {repayments.length === 1 ? 'payment' : 'installments'})
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(loan.id)}
              className="text-slate-400 hover:text-rose-400 transition-colors p-1"
              title="Delete history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
