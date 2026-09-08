import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const CORRECT_PIN = '000111';
const STORAGE_KEY = 'cashpo_delete_pin_verified_at';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper to check if PIN was already entered within the last 24 hours
export function isPinVerifiedWithinDay() {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEY);
    if (!timestamp) return false;
    const elapsed = Date.now() - Number(timestamp);
    return elapsed >= 0 && elapsed < ONE_DAY_MS;
  } catch (e) {
    return false;
  }
}

// Helper to mark PIN as verified for the next 24 hours
export function markPinVerified() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch (e) {
    console.error('Error saving PIN timestamp:', e);
  }
}

export default function PinVerificationModal({ isOpen, onClose, onSuccess, targetDescription = 'this record' }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const inputRefs = useRef([]);

  // Focus the first input box when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setIsSuccess(false);
      setIsShaking(false);
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle digit input & auto-progression
  const handleChange = (index, value) => {
    // Only accept numeric single character
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMsg('');

    // Advance focus to next input if filled
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if full 6 digits are entered
    const currentPin = newDigits.join('');
    if (currentPin.length === 6) {
      verifyPinAutomatically(currentPin);
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Automatic verification on 6th digit (No submit button needed)
  const verifyPinAutomatically = (enteredPin) => {
    if (enteredPin === CORRECT_PIN) {
      setIsSuccess(true);
      markPinVerified();

      // Automatically execute delete and close modal after brief visual confirmation
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 250);
    } else {
      setIsShaking(true);
      setErrorMsg('Incorrect PIN. Please try again.');
      if (navigator.vibrate) navigator.vibrate(200);

      setTimeout(() => {
        setIsShaking(false);
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 600);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className={`relative w-full max-w-sm bg-[#0e1626] rounded-3xl border border-slate-700/80 p-6 shadow-2xl z-10 text-center ${
        isShaking ? 'animate-bounce' : ''
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border ${
          isSuccess
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}>
          {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-6 h-6 stroke-[2.2]" />}
        </div>

        <h3 className="text-base font-bold text-slate-100">Security Verification</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Enter your 6-digit PIN to delete {targetDescription}.
        </p>
        <span className="text-[10px] text-teal-400/90 font-mono mt-1 block">
          (Verified once every 24 hours &bull; Auto-verifies on 6th digit)
        </span>

        {/* 6 Digit Input Boxes */}
        <div className="flex items-center justify-center gap-2 mt-5 mb-2">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-10 h-13 text-center text-xl font-bold font-mono rounded-xl bg-slate-900 border text-slate-100 focus:outline-none transition-all ${
                isSuccess
                  ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                  : digit
                  ? 'border-teal-400/80 bg-slate-800/80 ring-2 ring-teal-500/20'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              }`}
            />
          ))}
        </div>

        {/* Dynamic Status / Error Feedback */}
        <div className="h-6 flex items-center justify-center">
          {errorMsg ? (
            <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          ) : isSuccess ? (
            <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 font-mono animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PIN Verified! Deleting...</span>
            </p>
          ) : (
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-verifies when 6 digits are entered
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
