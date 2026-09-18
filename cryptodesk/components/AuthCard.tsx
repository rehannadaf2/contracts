'use client';

import { FormEvent, useState } from 'react';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

// Handles both Email/Password and Phone OTP authentication.
export const AuthCard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    }
    return window.recaptchaVerifier;
  };

  const onSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      await createUserWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const appVerifier = setupRecaptcha();
      const res = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmation(res);
    } catch {
      setError('Failed to send OTP. Use E.164 format, example +919999999999.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmation) return;
    setLoading(true);
    try {
      await confirmation.confirm(otp);
    } catch {
      setError('Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-binance-border bg-binance-card p-6 shadow-glow">
      <h2 className="mb-4 text-lg font-semibold">Login or Create Account</h2>
      <form onSubmit={onSignIn} className="space-y-3">
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Please wait...' : 'Email Login / Register'}
        </button>
      </form>

      <div className="my-4 h-px bg-binance-border" />

      <div className="space-y-3">
        <input className="input" placeholder="Phone (+91...)" value={phone} onChange={e => setPhone(e.target.value)} />
        <button className="btn-secondary w-full" onClick={sendOtp} disabled={loading}>
          Send OTP
        </button>
        {confirmation && (
          <>
            <input className="input" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
            <button className="btn-primary w-full" onClick={verifyOtp} disabled={loading}>
              Verify OTP
            </button>
          </>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <div id="recaptcha-container" />
    </div>
  );
};
