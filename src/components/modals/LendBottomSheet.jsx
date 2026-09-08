import React, { useState } from 'react';
import { X, Calendar, FileText, ArrowUpRight, Check } from 'lucide-react';
import { formatCurrency } from '../../services/periodAnalytics';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];
const QUICK_NOTES = ['Dinner / Food', 'Emergency cash', 'Petrol / Travel', 'Shopping', 'Bill split'];

export default function LendBottomSheet({ isOpen, onClose, onSubmit, isSubmitting }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    onSubmit({
      principalAmount: Number(amount),
      startDate: date,
      note: note.trim()
    });

    // Reset
    setAmount('');
    setNote('');
    setDate(todayStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Modal Container */}
      <div className="relative w-full max-w-md bg-[#0f172a] rounded-t-3xl border-t border-slate-700/80 p-5 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        {/* Pull handle bar */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Lend Money</h2>
              <p className="text-xs text-slate-400">Give money to Pothi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-bold font-mono text-emerald-400">
                ₹
              </span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
                className="w-full h-14 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-2xl text-2xl font-bold font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-1">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex-shrink-0 border ${
                    amount === String(amt)
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80'
                  }`}
                >
                  +{formatCurrency(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Date Lent
              </label>
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className="text-[11px] text-emerald-400 font-medium hover:underline"
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
                required
                className="w-full h-12 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Note Input with Quick Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Reason / Note (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Weekend dinner, Petrol, Emergency"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={60}
                className="w-full h-12 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Quick Note Tags */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-1">
              {QUICK_NOTES.map((presetNote) => (
                <button
                  key={presetNote}
                  type="button"
                  onClick={() => setNote(presetNote)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all flex-shrink-0 border ${
                    note === presetNote
                      ? 'bg-slate-700 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {presetNote}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !amount || Number(amount) <= 0}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Recording...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Record Lent {amount ? formatCurrency(amount) : ''}</span>
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
