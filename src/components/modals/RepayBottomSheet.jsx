import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, CheckCircle2, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { formatCurrency, formatFriendlyDate } from '../../services/periodAnalytics';
import { calculateDaysBetween } from '../../services/api';

const QUICK_PAY_MODES = ['GPay transfer', 'Cash return', 'PhonePe', 'PayTM'];

export default function RepayBottomSheet({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  activeLoans = [],
  initialSelectedLoan = null
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr);
  const [note, setNote] = useState('');

  // Sync initial selected loan
  useEffect(() => {
    if (initialSelectedLoan) {
      setSelectedLoanId(String(initialSelectedLoan.id));
      // Default amount to full pending
      setAmount(String(initialSelectedLoan.pendingAmount || ''));
    } else if (activeLoans.length > 0 && !selectedLoanId) {
      setSelectedLoanId(String(activeLoans[0].id));
      setAmount(String(activeLoans[0].pendingAmount || ''));
    }
  }, [initialSelectedLoan, activeLoans, isOpen]);

  if (!isOpen) return null;

  const currentLoan = activeLoans.find(l => String(l.id) === String(selectedLoanId)) || initialSelectedLoan;
  const pendingAmount = currentLoan ? Number(currentLoan.pendingAmount) : 0;
  const repayNumber = Number(amount) || 0;
  const willComplete = currentLoan && repayNumber >= pendingAmount && pendingAmount > 0;
  const remainingAfterRepay = Math.max(0, pendingAmount - repayNumber);

  // Turnaround preview
  const daysSinceLent = currentLoan ? calculateDaysBetween(currentLoan.startDate, date) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentLoan || repayNumber <= 0) return;

    onSubmit(currentLoan.id, {
      amount: repayNumber,
      date,
      note: note.trim()
    });

    setAmount('');
    setNote('');
    setDate(todayStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#0f172a] rounded-t-3xl border-t border-slate-700/80 p-5 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Add Repayment</h2>
              <p className="text-xs text-slate-400">Record money returned by Pothi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {activeLoans.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">No active loans to repay!</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Active Loan Selector if multiple loans exist */}
            {activeLoans.length > 1 && (
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Select Loan to Repay
                </label>
                <select
                  value={selectedLoanId}
                  onChange={(e) => {
                    setSelectedLoanId(e.target.value);
                    const chosen = activeLoans.find(l => String(l.id) === e.target.value);
                    if (chosen) setAmount(String(chosen.pendingAmount));
                  }}
                  className="w-full h-12 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500 transition-all"
                >
                  {activeLoans.map(l => (
                    <option key={l.id} value={l.id}>
                      Loan #{l.id}: {formatCurrency(l.pendingAmount)} pending ({formatFriendlyDate(l.startDate)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current Loan Snapshot Card */}
            {currentLoan && (
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-mono">Loan #{currentLoan.id}</span>
                  <p className="font-semibold text-slate-200 mt-0.5">
                    Principal: {formatCurrency(currentLoan.principalAmount)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Lent on {formatFriendlyDate(currentLoan.startDate)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-medium">Currently Due:</span>
                  <p className="text-base font-bold font-mono text-amber-400">
                    {formatCurrency(currentLoan.pendingAmount)}
                  </p>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Repayment Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-bold font-mono text-teal-400">
                  ₹
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={pendingAmount}
                  required
                  autoFocus
                  className="w-full h-14 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-2xl text-2xl font-bold font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-1">
                {/* Full Settle button */}
                <button
                  type="button"
                  onClick={() => setAmount(String(pendingAmount))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex-shrink-0 border ${
                    amount === String(pendingAmount)
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                      : 'bg-teal-950/40 text-teal-300 border-teal-500/30 hover:bg-teal-900/50'
                  }`}
                >
                  ✓ Full Settle ({formatCurrency(pendingAmount)})
                </button>

                {/* 50% button */}
                {pendingAmount > 100 && (
                  <button
                    type="button"
                    onClick={() => setAmount(String(Math.round(pendingAmount / 2)))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/80 flex-shrink-0"
                  >
                    Half ({formatCurrency(Math.round(pendingAmount / 2))})
                  </button>
                )}

                {/* Common micro amounts */}
                {[500, 1000, 2000].filter(val => val < pendingAmount).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 flex-shrink-0"
                  >
                    {formatCurrency(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Repaid */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Repayment Date
                </label>
                <button
                  type="button"
                  onClick={() => setDate(todayStr)}
                  className="text-[11px] text-teal-400 font-medium hover:underline"
                >
                  Set Today
                </button>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={currentLoan?.startDate}
                  required
                  className="w-full h-12 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            </div>

            {/* Note / Mode */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Payment Note / Mode
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. GPay, Cash, UPI"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={60}
                  className="w-full h-12 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>

              {/* Quick Tags */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-1">
                {QUICK_PAY_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setNote(mode)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 transition-all flex-shrink-0"
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Result Banner */}
            <div className={`p-3 rounded-xl border text-xs ${
              willComplete
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-teal-500/10 border-teal-500/20 text-teal-300'
            }`}>
              {willComplete ? (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Full Settlement!</span>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5">
                      This will close Loan #{currentLoan?.id} in {daysSinceLent} days total and move it to the Timelines archive.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <span className="font-bold">Partial Repayment:</span>
                  <p className="text-[11px] text-teal-300/80">
                    Remaining balance will be <strong className="text-amber-400">{formatCurrency(remainingAfterRepay)}</strong>. Loan remains active with +{daysSinceLent}d milestone.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || repayNumber <= 0}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Updating Ledger...
                  </span>
                ) : (
                  <span>Record Repayment of {amount ? formatCurrency(amount) : '₹0'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
