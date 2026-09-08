import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Table,
  LayoutGrid,
  Share2,
  Copy,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import LoanCard from '../components/cards/LoanCard';
import { formatCurrency, formatFriendlyDate, formatMonthYear } from '../services/periodAnalytics';

export default function AllTimelinesPage({ loans = [], onOpenRepay, onDeleteLoan }) {
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, COMPLETED, ACTIVE
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('CARDS'); // 'CARDS' | 'TABLE'
  const [copiedStatement, setCopiedStatement] = useState(false);

  // Date Filter State
  const [datePreset, setDatePreset] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isDateFilterExpanded, setIsDateFilterExpanded] = useState(false);

  // Extract all distinct year-months
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    loans.forEach(l => {
      if (l.startDate) monthsSet.add(l.startDate.substring(0, 7));
      if (Array.isArray(l.repayments)) {
        l.repayments.forEach(r => {
          if (r.date) monthsSet.add(r.date.substring(0, 7));
        });
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [loans]);

  // Helper to get start and end dates for presets
  const getDateRangeForPreset = (preset) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (preset === 'THIS_MONTH') {
      const start = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      const end = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
      return { start, end };
    }

    if (preset === 'LAST_MONTH') {
      const start = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
      const end = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
      return { start, end };
    }

    if (preset === 'SPECIFIC_MONTH' && selectedMonth) {
      const [y, m] = selectedMonth.split('-');
      const start = `${y}-${m}-01`;
      const end = new Date(Number(y), Number(m), 0).toISOString().split('T')[0];
      return { start, end };
    }

    if (preset === 'CUSTOM') {
      return { start: customStartDate, end: customEndDate };
    }

    return { start: null, end: null };
  };

  const activeDateRange = getDateRangeForPreset(datePreset);

  // Filtered list
  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      if (statusFilter === 'COMPLETED' && loan.status !== 'COMPLETED') return false;
      if (statusFilter === 'ACTIVE' && loan.status === 'COMPLETED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = loan.note && loan.note.toLowerCase().includes(q);
        const matchAmount = String(loan.principalAmount).includes(q);
        const matchDate = loan.startDate && loan.startDate.includes(q);
        const matchId = String(loan.id).includes(q);
        if (!matchNote && !matchAmount && !matchDate && !matchId) return false;
      }

      if (datePreset !== 'ALL') {
        const { start, end } = activeDateRange;
        const loanDate = loan.startDate;
        let inRange = false;

        if (start && end) {
          if (loanDate >= start && loanDate <= end) inRange = true;
          if (Array.isArray(loan.repayments)) {
            loan.repayments.forEach(r => {
              if (r.date && r.date >= start && r.date <= end) inRange = true;
            });
          }
        } else if (start) {
          if (loanDate >= start) inRange = true;
        } else if (end) {
          if (loanDate <= end) inRange = true;
        } else {
          inRange = true;
        }

        if (!inRange) return false;
      }

      return true;
    });
  }, [loans, statusFilter, searchQuery, datePreset, activeDateRange]);

  const completedLoans = loans.filter(l => l.status === 'COMPLETED');
  const totalFilteredAmount = filteredLoans.reduce((sum, l) => sum + (Number(l.principalAmount) || 0), 0);
  const totalFilteredRepaid = filteredLoans.reduce((sum, l) => sum + (Number(l.totalRepaid) || 0), 0);

  // Copy full statement
  const handleCopyStatement = () => {
    let text = `*CashPO Full Transaction Statement (Naveen . Pothi)*\n`;
    text += `Generated on: ${new Date().toLocaleDateString('en-IN')}\n\n`;

    filteredLoans.forEach(l => {
      text += `Loan #${l.id}: ₹${Number(l.principalAmount).toLocaleString('en-IN')} (${formatFriendlyDate(l.startDate)})\n`;
      text += `• Status: ${l.status} | Repaid: ₹${Number(l.totalRepaid).toLocaleString('en-IN')} | Pending: ₹${Number(l.pendingAmount).toLocaleString('en-IN')}\n`;
      if (l.repayments && l.repayments.length > 0) {
        text += `• Payments: ${l.repayments.map(r => `₹${r.amount} on ${r.date}`).join(', ')}\n`;
      }
      text += `\n`;
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedStatement(true);
      setTimeout(() => setCopiedStatement(false), 2500);
    }
  };

  const resetDateFilter = () => {
    setDatePreset('ALL');
    setSelectedMonth('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Archive Header Banner with Deep Summary */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">All Timelines & History</h2>
          </div>
          <button
            onClick={handleCopyStatement}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Copy formatted statement"
          >
            {copiedStatement ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedStatement ? 'Copied!' : 'Copy Statement'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Permanent chronological ledger of every lending and repayment journey with exact time-gap breakdowns.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
              In View
            </span>
            <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
              {filteredLoans.length} loans
            </span>
          </div>
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
              Principal Vol
            </span>
            <span className="text-base font-bold font-mono text-slate-200 mt-0.5 block">
              {formatCurrency(totalFilteredAmount)}
            </span>
          </div>
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
              Repaid Vol
            </span>
            <span className="text-base font-bold font-mono text-teal-300 mt-0.5 block">
              {formatCurrency(totalFilteredRepaid)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter & View Controls */}
      <div className="space-y-2.5">
        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search note, amount, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Toggle: Cards vs Table */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'CARDS' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card & Timeline View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'TABLE' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Ledger Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filter Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              statusFilter === 'ALL'
                ? 'bg-slate-700 text-slate-100 border-slate-600 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>All ({loans.length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed ({completedLoans.length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              statusFilter === 'ACTIVE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Active ({loans.length - completedLoans.length})</span>
          </button>
        </div>

        {/* Date & Month Filter Container */}
        <div className="glass-card rounded-2xl p-3 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-slate-200">Date Range & Months</span>
              {datePreset !== 'ALL' && (
                <span className="text-[10px] font-bold font-mono px-2 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {datePreset !== 'ALL' && (
                <button
                  onClick={resetDateFilter}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
              <button
                onClick={() => setIsDateFilterExpanded(!isDateFilterExpanded)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-0.5 p-1 rounded-lg"
              >
                <span>{isDateFilterExpanded ? 'Less' : 'More'}</span>
                {isDateFilterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Quick Date Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => { setDatePreset('ALL'); setSelectedMonth(''); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0 border ${
                datePreset === 'ALL'
                  ? 'bg-teal-500 text-slate-950 font-bold border-teal-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => { setDatePreset('THIS_MONTH'); setSelectedMonth(''); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0 border ${
                datePreset === 'THIS_MONTH'
                  ? 'bg-teal-500 text-slate-950 font-bold border-teal-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => { setDatePreset('LAST_MONTH'); setSelectedMonth(''); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0 border ${
                datePreset === 'LAST_MONTH'
                  ? 'bg-teal-500 text-slate-950 font-bold border-teal-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => { setDatePreset('CUSTOM'); setIsDateFilterExpanded(true); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0 border ${
                datePreset === 'CUSTOM'
                  ? 'bg-teal-500 text-slate-950 font-bold border-teal-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Custom Range...
            </button>
          </div>

          {/* Specific Months Chips */}
          {availableMonths.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex-shrink-0">
                Months:
              </span>
              {availableMonths.map(ym => (
                <button
                  key={ym}
                  onClick={() => {
                    setDatePreset('SPECIFIC_MONTH');
                    setSelectedMonth(ym);
                  }}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono transition-all flex-shrink-0 border ${
                    datePreset === 'SPECIFIC_MONTH' && selectedMonth === ym
                      ? 'bg-teal-500 text-slate-950 font-bold border-teal-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {formatMonthYear(ym + '-01')}
                </button>
              ))}
            </div>
          )}

          {/* Expanded Custom Date Range Input */}
          {(isDateFilterExpanded || datePreset === 'CUSTOM') && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/60 mt-2 space-y-2.5 animate-fadeIn">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Choose Specific Date Range
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setDatePreset('CUSTOM');
                    }}
                    className="w-full h-9 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setDatePreset('CUSTOM');
                    }}
                    className="w-full h-9 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {activeDateRange.start && (
                <div className="text-[11px] text-teal-300/90 font-mono bg-teal-950/30 p-2 rounded-lg border border-teal-500/20">
                  Filtering transactions between {formatFriendlyDate(activeDateRange.start)} and{' '}
                  {activeDateRange.end ? formatFriendlyDate(activeDateRange.end) : 'present'}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Output List: Either Cards View or Compact Table View */}
      {filteredLoans.length === 0 ? (
        <div className="p-8 text-center glass-card rounded-2xl border border-slate-800">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-slate-300 font-semibold">No transactions found</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Try adjusting your date range, month selection, or search query.
          </p>
          <button
            onClick={resetDateFilter}
            className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 font-medium transition-colors"
          >
            Clear Date Filters
          </button>
        </div>
      ) : viewMode === 'TABLE' ? (
        /* COMPACT LEDGER MATRIX TABLE VIEW (Rich Content) */
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl animate-fadeIn">
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Full Peer Ledger Matrix</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">{filteredLoans.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-950/60">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Note</th>
                  <th className="py-2.5 px-3 text-right">Lent</th>
                  <th className="py-2.5 px-3 text-right">Repaid</th>
                  <th className="py-2.5 px-3 text-right">Pending</th>
                  <th className="py-2.5 px-3 text-center">TAT</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredLoans.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400 font-bold">#{loan.id}</td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{formatFriendlyDate(loan.startDate)}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-300 truncate max-w-[120px]">{loan.note || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-100">{formatCurrency(loan.principalAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-teal-300">{formatCurrency(loan.totalRepaid)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400">{formatCurrency(loan.pendingAmount)}</td>
                    <td className="py-2.5 px-3 text-center text-teal-400">
                      {loan.totalTurnaroundDays !== null && loan.totalTurnaroundDays !== undefined ? `${loan.totalTurnaroundDays}d` : 'active'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        loan.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : loan.status === 'PARTIAL_PAID'
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="space-y-4">
          {filteredLoans.map(loan => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onOpenRepay={(selected) => onOpenRepay(selected)}
              onDelete={onDeleteLoan}
            />
          ))}
        </div>
      )}
    </div>
  );
}
