import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatFriendlyDate } from '../../services/periodAnalytics';

const QUICK_TAGS = ['GPay transfer', 'Cash return', 'PhonePe', 'UPI'];

export default function CascadeRepayCard({
  activeLoans = [],
  totalPending = 0,
  onApplyCascade,
  isSubmitting = false
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr);
  const [note, setNote] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const numericAmount = Number(amount) || 0;
  const isOverpayment = numericAmount > totalPending && totalPending > 0;
  const isValidAmount = numericAmount > 0 && !isOverpayment;

  // Sort active loans by startDate ascending (oldest first - FIFO)
  const sortedActiveLoans = useMemo(() => {
    return [...activeLoans].sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
  }, [activeLoans]);

  // Compute live waterfall simulation
  const waterfallPreview = useMemo(() => {
    if (!numericAmount || numericAmount <= 0) return [];

    let remainingToDistribute = numericAmount;

    return sortedActiveLoans.map(loan => {
      const currentPending = Number(loan.pendingAmount) || 0;
      const willAllocate = Math.min(currentPending, Math.max(0, remainingToDistribute));
      const newPending = Math.max(0, currentPending - willAllocate);
      const willComplete = willAllocate > 0 && newPending === 0;

      remainingToDistribute = Math.max(0, remainingToDistribute - willAllocate);

      return {
        loan,
        currentPending,
        willAllocate,
        newPending,
        willComplete
      };
    });
  }, [sortedActiveLoans, numericAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidAmount || isSubmitting) return;

    onApplyCascade({
      amount: numericAmount,
      date,
      note: note.trim()
    });

    // Reset input upon submit
    setAmount('');
    setNote('');
    setDate(todayStr);
  };

  if (totalPending <= 0) return null;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-xl space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Quick Cascade Repayment</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-teal-950/60 text-teal-300 border border-teal-500/30">
                FIFO
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Enter amount Pothi gave &bull; Clears oldest loans first
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60"
        >
          <span>{showDetails ? 'Less' : 'Date/Note'}</span>
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main Amount Input */}
        <div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-bold font-mono text-teal-400">
              ₹
            </span>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 250"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full h-13 pl-10 pr-4 bg-slate-900 border rounded-2xl text-xl font-bold font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all ${
                isOverpayment
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
              }`}
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-0.5">
            {[200, 500, 1000, 2000].filter(val => val < totalPending).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(String(val))}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex-shrink-0 border ${
                  amount === String(val)
                    ? 'bg-teal-500 text-slate-950 font-bold border-teal-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                +{formatCurrency(val)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount(String(totalPending))}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex-shrink-0 border ${
                amount === String(totalPending)
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50'
              }`}
            >
              Full Settle ({formatCurrency(totalPending)})
            </button>
          </div>
        </div>

        {/* Collapsible Date and Note Row */}
        {showDetails && (
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/60 space-y-2.5 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Repayment Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-9 pl-8 pr-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Payment Mode / Note
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. GPay"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full h-9 pl-8 pr-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setNote(tag)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-all flex-shrink-0 border ${
                    note === tag
                      ? 'bg-slate-700 text-teal-300 border-teal-500/40'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* OVERPAYMENT ERROR ALERT (Decision 3: show error message, don't proceed) */}
        {isOverpayment && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Overpayment Blocked</span>
              <p className="text-[11px] text-rose-300/90 mt-0.5">
                Amount ({formatCurrency(numericAmount)}) cannot exceed total pending debt of{' '}
                <strong>{formatCurrency(totalPending)}</strong>. Please enter an amount up to{' '}
                {formatCurrency(totalPending)}.
              </p>
            </div>
          </div>
        )}

        {/* LIVE WATERFALL CASCADE PREVIEW */}
        {isValidAmount && waterfallPreview.length > 0 && (
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>Live FIFO Distribution Preview:</span>
              </span>
              <span className="font-mono text-teal-400 font-bold">
                Allocating {formatCurrency(numericAmount)}
              </span>
            </div>

            <div className="space-y-1.5 divide-y divide-slate-800/50">
              {waterfallPreview.map(({ loan, currentPending, willAllocate, newPending, willComplete }) => (
                <div key={loan.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-200">Loan #{loan.id}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({formatFriendlyDate(loan.startDate)})
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Due: {formatCurrency(currentPending)}
                    </span>
                  </div>

                  <div className="text-right">
                    {willComplete ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        - {formatCurrency(willAllocate)} (Will Settle ✓)
                      </span>
                    ) : willAllocate > 0 ? (
                      <div>
                        <span className="text-[11px] font-bold text-teal-300">
                          - {formatCurrency(willAllocate)}
                        </span>
                        <span className="text-[10px] text-amber-400/90 block">
                          Rem: {formatCurrency(newPending)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        No change ({formatCurrency(currentPending)} rem)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Projected Net Balance */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Net Pending After Cascade:</span>
              <span className="font-bold text-sm text-amber-400">
                {formatCurrency(Math.max(0, totalPending - numericAmount))}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={!isValidAmount || isSubmitting}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              Applying Cascade Repayment...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>
                {numericAmount > 0
                  ? `Apply ${formatCurrency(numericAmount)} Across Loans`
                  : 'Enter Repayment Amount'}
              </span>
              {numericAmount > 0 && <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />}
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
