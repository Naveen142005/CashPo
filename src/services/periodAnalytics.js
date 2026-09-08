import { calculateDaysBetween } from './api.js';

// Format currency in Indian format (₹)
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// Format friendly date: "7 Sep 2026"
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

// Format short month: "Sep 2026"
export function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

// Compute all comprehensive periods, turnaround times, streaks, and analytics
export function computePeriodAnalytics(loans = []) {
  const todayStr = new Date().toISOString().split('T')[0];

  let totalLent = 0;
  let totalRepaid = 0;
  let totalPending = 0;
  let totalInstallmentsLogged = 0;

  const completedLoans = [];
  const activeLoans = [];
  const allEvents = []; // { date, type: 'LEND'|'REPAY', amount, note, loanId, loan }

  // Day of week frequency counter
  const weekdayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  loans.forEach(loan => {
    const principal = Number(loan.principalAmount) || 0;
    const repaid = Number(loan.totalRepaid) || 0;
    const pending = Number(loan.pendingAmount) || 0;

    totalLent += principal;
    totalRepaid += repaid;
    totalPending += pending;

    // Track lending day
    if (loan.startDate) {
      const d = new Date(loan.startDate);
      if (!isNaN(d.getDay())) weekdayCounts[d.getDay()]++;

      allEvents.push({
        date: loan.startDate,
        type: 'LEND',
        amount: principal,
        note: loan.note || 'Lent money',
        loanId: loan.id,
        loan
      });
    }

    // Track repayments
    if (Array.isArray(loan.repayments)) {
      totalInstallmentsLogged += loan.repayments.length;
      loan.repayments.forEach(rep => {
        if (rep.date) {
          allEvents.push({
            date: rep.date,
            type: 'REPAY',
            amount: Number(rep.amount) || 0,
            note: rep.note || 'Repayment',
            loanId: loan.id,
            loan
          });
        }
      });
    }

    if (loan.status === 'COMPLETED') {
      completedLoans.push(loan);
    } else {
      activeLoans.push(loan);
    }
  });

  // 1. Turnaround Time (TAT) Calculations
  let fastestSettle = null;
  let longestSettle = null;
  let totalSettleDays = 0;

  // Speed buckets
  let fastCount = 0;     // <= 3 days
  let moderateCount = 0; // 4 - 14 days
  let slowCount = 0;     // > 14 days

  completedLoans.forEach(loan => {
    let days = loan.totalTurnaroundDays;
    if (days === null || days === undefined) {
      days = calculateDaysBetween(loan.startDate, loan.completedDate || loan.startDate);
    }

    totalSettleDays += days;

    if (days <= 3) fastCount++;
    else if (days <= 14) moderateCount++;
    else slowCount++;

    if (!fastestSettle || days < fastestSettle.days) {
      fastestSettle = { days, loan };
    }

    if (!longestSettle || days > longestSettle.days) {
      longestSettle = { days, loan };
    }
  });

  const averageSettleDays = completedLoans.length > 0
    ? Math.round((totalSettleDays / completedLoans.length) * 10) / 10
    : 0;

  const averageInstallmentsPerLoan = completedLoans.length > 0
    ? Math.round((completedLoans.reduce((acc, l) => acc + (l.repayments?.length || 0), 0) / completedLoans.length) * 10) / 10
    : 0;

  const recoveryRate = totalLent > 0
    ? Math.min(100, Math.round((totalRepaid / totalLent) * 1000) / 10)
    : 100;

  const averageLoanAmount = loans.length > 0
    ? Math.round(totalLent / loans.length)
    : 0;

  // 2. Inactivity Gaps Between Events
  // Sort events chronologically
  const sortedEvents = [...allEvents].sort((a, b) => a.date.localeCompare(b.date));
  const uniqueDates = [...new Set(sortedEvents.map(e => e.date))].sort();

  let longestInactivityGapDays = 0;
  let longestInactivityDates = null;
  const allGapsLedger = [];

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const d1 = uniqueDates[i];
    const d2 = uniqueDates[i + 1];
    const gap = calculateDaysBetween(d1, d2);

    if (gap > 0) {
      allGapsLedger.push({
        fromDate: d1,
        toDate: d2,
        gapDays: gap
      });
    }

    if (gap > longestInactivityGapDays) {
      longestInactivityGapDays = gap;
      longestInactivityDates = { from: d1, to: d2 };
    }
  }

  // Sort gaps ledger with highest gap first
  allGapsLedger.sort((a, b) => b.gapDays - a.gapDays);

  const mostRecentDate = uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : todayStr;
  const currentInactivityGapDays = calculateDaysBetween(mostRecentDate, todayStr);

  // 3. Active Loans Aging & Estimated Completion
  const activeAging = activeLoans.map(loan => {
    const daysWaiting = calculateDaysBetween(loan.startDate, todayStr);
    const estimatedSettleDays = averageSettleDays || 7;
    const isOverdue = daysWaiting > estimatedSettleDays;
    const daysOverdue = Math.max(0, daysWaiting - estimatedSettleDays);

    return {
      loan,
      daysWaiting,
      estimatedSettleDays,
      isOverdue,
      daysOverdue
    };
  }).sort((a, b) => b.daysWaiting - a.daysWaiting);

  // 4. Monthly Performance Matrix
  const monthlyMap = {};
  loans.forEach(loan => {
    if (!loan.startDate) return;
    const ym = loan.startDate.substring(0, 7);
    if (!monthlyMap[ym]) {
      monthlyMap[ym] = {
        yearMonth: ym,
        label: formatMonthYear(loan.startDate),
        totalLent: 0,
        totalRepaid: 0,
        loansCount: 0,
        settledCount: 0
      };
    }
    monthlyMap[ym].totalLent += Number(loan.principalAmount) || 0;
    monthlyMap[ym].loansCount += 1;
    if (loan.status === 'COMPLETED') monthlyMap[ym].settledCount += 1;
  });

  // Add repayments to respective repayment months
  loans.forEach(loan => {
    if (Array.isArray(loan.repayments)) {
      loan.repayments.forEach(rep => {
        if (!rep.date) return;
        const ym = rep.date.substring(0, 7);
        if (!monthlyMap[ym]) {
          monthlyMap[ym] = {
            yearMonth: ym,
            label: formatMonthYear(rep.date),
            totalLent: 0,
            totalRepaid: 0,
            loansCount: 0,
            settledCount: 0
          };
        }
        monthlyMap[ym].totalRepaid += Number(rep.amount) || 0;
      });
    }
  });

  const monthlyMatrix = Object.values(monthlyMap).sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));

  // 5. Recent Activity Feed (Latest 8 events)
  const recentActivityFeed = [...allEvents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  // 6. Most Frequent Borrowing Day
  let mostCommonDayIndex = 1;
  let maxDayCount = 0;
  Object.keys(weekdayCounts).forEach(dayIdx => {
    if (weekdayCounts[dayIdx] > maxDayCount) {
      maxDayCount = weekdayCounts[dayIdx];
      mostCommonDayIndex = Number(dayIdx);
    }
  });
  const mostFrequentDayName = weekdayNames[mostCommonDayIndex];

  return {
    totalLent,
    totalRepaid,
    totalPending,
    totalLoansCount: loans.length,
    activeCount: activeLoans.length,
    completedCount: completedLoans.length,
    totalInstallmentsLogged,
    averageInstallmentsPerLoan,
    recoveryRate,
    averageLoanAmount,
    fastestSettle,
    longestSettle,
    averageSettleDays,
    speedBuckets: {
      fast: fastCount,
      moderate: moderateCount,
      slow: slowCount
    },
    currentInactivityGapDays,
    longestInactivityGapDays,
    longestInactivityDates,
    mostRecentDate,
    allGapsLedger,
    activeAging,
    monthlyMatrix,
    recentActivityFeed,
    mostFrequentDayName
  };
}
