import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import ActiveLoansPage from './pages/ActiveLoansPage';
import AllTimelinesPage from './pages/AllTimelinesPage';
import DashboardPage from './pages/DashboardPage';
import LendBottomSheet from './components/modals/LendBottomSheet';
import RepayBottomSheet from './components/modals/RepayBottomSheet';
import PinVerificationModal, { isPinVerifiedWithinDay } from './components/modals/PinVerificationModal';
import { getLoans, createLoan, addRepayment, applyCascadeRepayment, deleteLoan } from './services/api';
import { computePeriodAnalytics } from './services/periodAnalytics';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'timelines' | 'dashboard'
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingCascade, setIsApplyingCascade] = useState(false);

  // Modals state
  const [isLendOpen, setIsLendOpen] = useState(false);
  const [isRepayOpen, setIsRepayOpen] = useState(false);
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState(null);

  // 6-digit PIN verification modal state (for delete protection)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingDeleteLoanId, setPendingDeleteLoanId] = useState(null);

  // Settlement celebration toast
  const [celebrationToast, setCelebrationToast] = useState(null);

  // Fetch loans on initial load
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const data = await getLoans();
      setLoans(data || []);
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats on the fly
  const analytics = computePeriodAnalytics(loans);

  // Handler: Lend Money (Naveen -> Friend)
  const handleLendSubmit = async ({ principalAmount, startDate, note }) => {
    setIsSubmitting(true);
    try {
      const created = await createLoan({ principalAmount, startDate, note });
      setLoans(prev => [created, ...prev.filter(l => l.id !== created.id)]);
      setIsLendOpen(false);
      setActiveTab('active');
    } catch (err) {
      console.error('Error lending money:', err);
      alert('Failed to record loan. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Repay Money (Friend -> Naveen)
  const handleRepaySubmit = async (loanId, { amount, date, note }) => {
    setIsSubmitting(true);
    try {
      const updated = await addRepayment(loanId, { amount, date, note });
      setLoans(prev => prev.map(l => String(l.id) === String(loanId) ? updated : l));
      setIsRepayOpen(false);
      setSelectedLoanForRepay(null);

      // If fully settled, trigger celebration toast!
      if (updated.status === 'COMPLETED') {
        setCelebrationToast({
          title: 'Loan Fully Settled!',
          message: `Loan #${updated.id} of ₹${updated.principalAmount.toLocaleString('en-IN')} is closed in ${updated.totalTurnaroundDays || 0} days! Moved to Timelines archive.`
        });
        setTimeout(() => setCelebrationToast(null), 5000);
      }
    } catch (err) {
      console.error('Error adding repayment:', err);
      alert('Failed to record repayment: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Apply FIFO Cascade Repayment across multiple loans
  const handleApplyCascade = async ({ amount, date, note }) => {
    setIsApplyingCascade(true);
    try {
      const result = await applyCascadeRepayment({ amount, date, note });
      setLoans(result.allLoans);

      // Trigger celebration toast if any loans were fully closed
      if (result.closedLoans && result.closedLoans.length > 0) {
        const closedCount = result.closedLoans.length;
        setCelebrationToast({
          title: closedCount === 1 ? 'Loan Fully Settled!' : `${closedCount} Loans Fully Settled!`,
          message: `Cascade repayment of ₹${Number(amount).toLocaleString('en-IN')} successfully settled ${
            closedCount === 1 ? `Loan #${result.closedLoans[0].id}` : `${closedCount} loans`
          } and moved to Timelines archive!`
        });
        setTimeout(() => setCelebrationToast(null), 5000);
      }
    } catch (err) {
      console.error('Error applying cascade repayment:', err);
      alert(err.message || 'Failed to apply cascade repayment.');
    } finally {
      setIsApplyingCascade(false);
    }
  };

  // Direct execution of deletion
  const executeDeleteLoan = async (loanId) => {
    try {
      await deleteLoan(loanId);
      setLoans(prev => prev.filter(l => String(l.id) !== String(loanId)));
    } catch (err) {
      console.error('Failed to delete loan:', err);
    }
  };

  // Handler: Delete button clicked on any loan
  const handleDeleteLoan = (loanId) => {
    if (isPinVerifiedWithinDay()) {
      // PIN already verified within the last 24 hours -> directly delete!
      executeDeleteLoan(loanId);
    } else {
      // PIN not verified yet or > 1 day elapsed -> request 6-digit PIN
      setPendingDeleteLoanId(loanId);
      setIsPinModalOpen(true);
    }
  };

  // Open Repay sheet with specific loan preselected
  const handleOpenRepayForLoan = (loan) => {
    setSelectedLoanForRepay(loan);
    setIsRepayOpen(true);
  };

  const activeLoans = loans.filter(l => l.status !== 'COMPLETED');
  const completedLoans = loans.filter(l => l.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Sticky Mobile Header */}
      <Header
        totalPending={analytics.totalPending}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        onOpenLend={() => setIsLendOpen(true)}
      />

      {/* Main Content Area (Max-w-md provides perfect mobile app feel on desktop too) */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3">
        {/* Celebration Toast upon Loan Settlement */}
        {celebrationToast && (
          <div className="mb-3 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-xl shadow-emerald-500/10 flex items-start gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs">
                <span>{celebrationToast.title}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] text-emerald-300/90 mt-0.5 leading-relaxed">
                {celebrationToast.message}
              </p>
            </div>
            <button
              onClick={() => setCelebrationToast(null)}
              className="text-xs text-emerald-400 hover:text-emerald-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* View Switcher */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono text-slate-400">Syncing CashPO ledger...</p>
          </div>
        ) : (
          <>
            {activeTab === 'active' && (
              <ActiveLoansPage
                loans={loans}
                analytics={analytics}
                onOpenLend={() => setIsLendOpen(true)}
                onOpenRepay={(loan) => handleOpenRepayForLoan(loan)}
                onApplyCascade={handleApplyCascade}
                isApplyingCascade={isApplyingCascade}
                onDeleteLoan={handleDeleteLoan}
              />
            )}

            {activeTab === 'timelines' && (
              <AllTimelinesPage
                loans={loans}
                onOpenRepay={(loan) => handleOpenRepayForLoan(loan)}
                onDeleteLoan={handleDeleteLoan}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardPage analytics={analytics} />
            )}
          </>
        )}
      </main>

      {/* Thumb-friendly Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeLoans.length}
        completedCount={completedLoans.length}
      />

      {/* Lend Bottom Sheet Drawer */}
      <LendBottomSheet
        isOpen={isLendOpen}
        onClose={() => setIsLendOpen(false)}
        onSubmit={handleLendSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Repay Bottom Sheet Drawer */}
      <RepayBottomSheet
        isOpen={isRepayOpen}
        onClose={() => {
          setIsRepayOpen(false);
          setSelectedLoanForRepay(null);
        }}
        onSubmit={handleRepaySubmit}
        isSubmitting={isSubmitting}
        activeLoans={activeLoans}
        initialSelectedLoan={selectedLoanForRepay}
      />

      {/* 6-Digit PIN Security Modal for Delete Protection (000111) */}
      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingDeleteLoanId(null);
        }}
        onSuccess={() => {
          if (pendingDeleteLoanId) {
            executeDeleteLoan(pendingDeleteLoanId);
            setPendingDeleteLoanId(null);
          }
        }}
        targetDescription={pendingDeleteLoanId ? `Loan #${pendingDeleteLoanId}` : 'this record'}
      />
    </div>
  );
}
