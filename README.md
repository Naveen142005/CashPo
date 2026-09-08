# CashPO — Peer Loan & Turnaround Period Tracker

A mobile-first, high-grade personal finance application specifically designed to track money lent and repaid between two people (Naveen and Friend). 

Built with **React**, **Tailwind CSS v4**, **Lucide Icons**, and integrated with your live **MockAPI** (`https://69824bfdc9a606f5d449a361.mockapi.io/CashPO`).

---

## Key Features

1. **One-Way Lending Model**:
   - **Naveen is always the Lender**; **Friend is always the Borrower**.
   - No confusing role flips or account setups.

2. **The Two Primary Quick Buttons**:
   - **`[ + Lend Money ]`**: Tap to log an amount (e.g. ₹1,000), date, and note.
   - **`[ + Add Repay ]`**: Tap to record a partial or full repayment from your friend.

3. **Interactive Horizontal Milestone Timelines**:
   - Each loan displays a swipeable horizontal timeline:
     - `Lent Node` (e.g. 7 Sep, ₹1,000)
     - `+8d gap pill`
     - `Repaid Node` (e.g. 15 Sep, ₹500)
     - `+7d gap pill`
     - `Waiting Pending Node` or `Settled ✓ Closed Node`
   - Tap any milestone node to open an inspection card showing exact amounts and notes.

4. **Lifecycle & Auto-Archival**:
   - `PENDING` $\rightarrow$ `PARTIAL PAID` $\rightarrow$ `COMPLETED`.
   - When the remaining balance reaches ₹0, the card triggers a celebration toast, marks status as `COMPLETED`, automatically disappears from the **Active** page, and moves into the **All Timelines** archive.

5. **Period & Streak Dashboard**:
   - ⚡ **Shortest Streak**: Quickest time your friend ever fully repaid a loan.
   - ⏳ **Longest Streak**: Longest loan turnaround time.
   - ⏱️ **Average Repayment Period**: Mean duration across all historical loans.
   - 🕊️ **Transaction Gap Tracker**: Days elapsed since the last transaction, plus the longest historical calm period between requests.
   - 🕒 **Active Debt Aging**: Ticking day counter for all pending loans.

---

## How to Run

### 1. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

### 2. Build for Production
```bash
npm run build
npm run preview
```

### 3. Mobile Phone Usage (PWA / Home Screen)
Open the URL on your mobile browser (Safari / Chrome) and tap **"Add to Home Screen"**. CashPO will run as a native standalone app.
