// API Service integrating directly with MockAPI: https://69824bfdc9a606f5d449a361.mockapi.io/CashPO
// Fresh clean slate mode (zero dummy/seed records)

const MOCKAPI_URL = 'https://69824bfdc9a606f5d449a361.mockapi.io/CashPO';
const STORAGE_KEY = 'cashpo_clean_ledger_v3';

// Clean slate: No seed data
const INITIAL_SEED = [];

// Helper to get local cache
function getLocalCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading cache:', e);
    return null;
  }
}

// Helper to set local cache
function setLocalCache(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing cache:', e);
  }
}

// Calculate days between 2 YYYY-MM-DD strings
export function calculateDaysBetween(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// 1. Fetch All Loans
export async function getLoans() {
  try {
    const res = await fetch(MOCKAPI_URL, {
      headers: { 'content-type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setLocalCache(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('MockAPI network fetch failed, using offline fallback:', err);
  }

  // Fallback to local cache
  const cached = getLocalCache();
  if (cached && Array.isArray(cached)) {
    return cached;
  }

  // Clean empty array
  setLocalCache([]);
  return [];
}

// 2. Create a new loan (Naveen lends to Pothi)
export async function createLoan({ principalAmount, startDate, note, borrower = 'Pothi' }) {
  const newLoan = {
    lender: 'Naveen',
    borrower: borrower || 'Pothi',
    principalAmount: Number(principalAmount),
    startDate: startDate || new Date().toISOString().split('T')[0],
    note: note?.trim() || 'Friendly loan',
    status: 'PENDING',
    repayments: [],
    totalRepaid: 0,
    pendingAmount: Number(principalAmount),
    totalTurnaroundDays: null,
    completedDate: null,
    createdAt: new Date().toISOString()
  };

  let savedLoan = null;

  try {
    const res = await fetch(MOCKAPI_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newLoan)
    });
    if (res.ok) {
      savedLoan = await res.json();
    }
  } catch (err) {
    console.warn('MockAPI POST failed, saving locally:', err);
  }

  if (!savedLoan) {
    savedLoan = { ...newLoan, id: 'local_' + Date.now() };
  }

  const current = (await getLoans()).filter(item => item.id !== savedLoan.id);
  const updated = [savedLoan, ...current];
  setLocalCache(updated);
  return savedLoan;
}

// 3. Add a repayment milestone (Friend repays Naveen)
export async function addRepayment(loanId, { amount, date, note }) {
  const allLoans = await getLoans();
  const existing = allLoans.find(l => String(l.id) === String(loanId));
  if (!existing) {
    throw new Error('Loan not found: ' + loanId);
  }

  const repayAmount = Number(amount);
  const repayDate = date || new Date().toISOString().split('T')[0];
  const newTotalRepaid = (Number(existing.totalRepaid) || 0) + repayAmount;
  const newPendingAmount = Math.max(0, (Number(existing.principalAmount) || 0) - newTotalRepaid);

  // Compute days gap since loan inception
  const daysSinceLent = calculateDaysBetween(existing.startDate, repayDate);

  // Compute days gap since last milestone
  const prevDate = existing.repayments && existing.repayments.length > 0
    ? existing.repayments[existing.repayments.length - 1].date
    : existing.startDate;
  const daysSincePrevious = calculateDaysBetween(prevDate, repayDate);

  const newMilestone = {
    id: 'rep_' + Date.now(),
    amount: repayAmount,
    date: repayDate,
    note: note?.trim() || 'Repayment',
    daysSinceLent,
    daysSincePrevious
  };

  const updatedRepayments = [...(existing.repayments || []), newMilestone];
  const isCompleted = newPendingAmount === 0;

  const updatedLoan = {
    ...existing,
    totalRepaid: newTotalRepaid,
    pendingAmount: newPendingAmount,
    repayments: updatedRepayments,
    status: isCompleted ? 'COMPLETED' : 'PARTIAL_PAID',
    completedDate: isCompleted ? repayDate : null,
    totalTurnaroundDays: isCompleted ? daysSinceLent : null
  };

  let finalSaved = null;
  try {
    const res = await fetch(`${MOCKAPI_URL}/${loanId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updatedLoan)
    });
    if (res.ok) {
      finalSaved = await res.json();
    }
  } catch (err) {
    console.warn('MockAPI PUT failed, saving locally:', err);
  }

  if (!finalSaved) {
    finalSaved = updatedLoan;
  }

  const updatedList = allLoans.map(item => String(item.id) === String(loanId) ? finalSaved : item);
  setLocalCache(updatedList);
  return finalSaved;
}

// 3b. Apply FIFO Cascade Repayment across multiple loans
export async function applyCascadeRepayment({ amount, date, note }) {
  const allLoans = await getLoans();
  const totalRepay = Number(amount);
  if (!totalRepay || totalRepay <= 0) {
    throw new Error('Please enter a valid repayment amount.');
  }

  // Filter active loans (not completed) and sort by startDate ascending (oldest first - FIFO)
  const activeLoans = allLoans
    .filter(l => l.status !== 'COMPLETED' && (Number(l.pendingAmount) || 0) > 0)
    .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));

  const totalPending = activeLoans.reduce((sum, l) => sum + (Number(l.pendingAmount) || 0), 0);
  if (totalRepay > totalPending) {
    throw new Error(`Repayment amount (₹${totalRepay.toLocaleString('en-IN')}) cannot exceed total pending debt (₹${totalPending.toLocaleString('en-IN')}).`);
  }

  const repayDate = date || new Date().toISOString().split('T')[0];
  let remainingToDistribute = totalRepay;
  const updatedLoanMap = {};
  const closedLoans = [];

  for (const loan of activeLoans) {
    if (remainingToDistribute <= 0) break;

    const currentPending = Number(loan.pendingAmount) || 0;
    const allocated = Math.min(currentPending, remainingToDistribute);
    const newTotalRepaid = (Number(loan.totalRepaid) || 0) + allocated;
    const newPendingAmount = Math.max(0, (Number(loan.principalAmount) || 0) - newTotalRepaid);

    const daysSinceLent = calculateDaysBetween(loan.startDate, repayDate);
    const prevDate = loan.repayments && loan.repayments.length > 0
      ? loan.repayments[loan.repayments.length - 1].date
      : loan.startDate;
    const daysSincePrevious = calculateDaysBetween(prevDate, repayDate);

    const newMilestone = {
      id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      amount: allocated,
      date: repayDate,
      note: note?.trim() || `Lump-sum settlement`,
      daysSinceLent,
      daysSincePrevious
    };

    const updatedRepayments = [...(loan.repayments || []), newMilestone];
    const isCompleted = newPendingAmount === 0;

    const updatedLoan = {
      ...loan,
      totalRepaid: newTotalRepaid,
      pendingAmount: newPendingAmount,
      repayments: updatedRepayments,
      status: isCompleted ? 'COMPLETED' : 'PARTIAL_PAID',
      completedDate: isCompleted ? repayDate : null,
      totalTurnaroundDays: isCompleted ? daysSinceLent : null
    };

    if (isCompleted) {
      closedLoans.push(updatedLoan);
    }

    // Persist to MockAPI
    let finalSaved = null;
    try {
      const res = await fetch(`${MOCKAPI_URL}/${loan.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updatedLoan)
      });
      if (res.ok) {
        finalSaved = await res.json();
      }
    } catch (err) {
      console.warn(`MockAPI PUT failed for loan #${loan.id}, saving locally:`, err);
    }

    updatedLoanMap[loan.id] = finalSaved || updatedLoan;
    remainingToDistribute -= allocated;
  }

  // Merge back into all loans
  const updatedAllLoans = allLoans.map(l => updatedLoanMap[l.id] || l);
  setLocalCache(updatedAllLoans);

  return {
    allLoans: updatedAllLoans,
    closedLoans,
    totalDistributed: totalRepay
  };
}

// 4. Delete a loan
export async function deleteLoan(loanId) {
  try {
    await fetch(`${MOCKAPI_URL}/${loanId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('MockAPI DELETE failed:', err);
  }
  const current = (await getLoans()).filter(item => String(item.id) !== String(loanId));
  setLocalCache(current);
  return true;
}

// 5. Clear All Data (Full reset to empty clean slate)
export async function clearAllLoans() {
  try {
    const res = await fetch(MOCKAPI_URL);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          await fetch(`${MOCKAPI_URL}/${item.id}`, { method: 'DELETE' });
        }
      }
    }
  } catch (err) {
    console.warn('MockAPI clear failed:', err);
  }
  setLocalCache([]);
  return [];
}
