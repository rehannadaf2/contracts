'use client';

import { FormEvent, useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';

// Form used to publish BUY/SELL ads to Firestore.
export const CreateAdForm = () => {
  const { user } = useAuth();
  const [side, setSide] = useState<'buy' | 'sell'>('sell');
  const [price, setPrice] = useState('');
  const [minLimit, setMinLimit] = useState('');
  const [maxLimit, setMaxLimit] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank'>('UPI');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await addDoc(collection(db, 'ads'), {
      side,
      price: Number(price),
      minLimit: Number(minLimit),
      maxLimit: Number(maxLimit),
      paymentMethod,
      ownerId: user.uid,
      ownerName: user.email || user.phoneNumber || 'Trader',
      active: true,
      createdAt: Date.now(),
    });

    setPrice('');
    setMinLimit('');
    setMaxLimit('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-binance-border bg-binance-card p-4">
      <h3 className="text-base font-semibold">Create Ad</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="input" value={side} onChange={e => setSide(e.target.value as 'buy' | 'sell')}>
          <option value="buy">BUY</option>
          <option value="sell">SELL</option>
        </select>
        <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as 'UPI' | 'Bank')}>
          <option value="UPI">UPI</option>
          <option value="Bank">Bank</option>
        </select>
      </div>
      <input className="input" type="number" placeholder="Price (INR)" value={price} onChange={e => setPrice(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" type="number" placeholder="Min limit" value={minLimit} onChange={e => setMinLimit(e.target.value)} />
        <input className="input" type="number" placeholder="Max limit" value={maxLimit} onChange={e => setMaxLimit(e.target.value)} />
      </div>
      <button className="btn-primary w-full">Publish Ad</button>
    </form>
  );
};
