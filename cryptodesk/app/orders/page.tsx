'use client';

import Link from 'next/link';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { formatDateTime, formatInr } from '@/lib/format';
import { Trade } from '@/types';

export default function OrdersPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'trades'), where('buyerId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Trade, 'id'>) }));
      setTrades(docs);
    });
    return () => unsub();
  }, [user]);

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-6xl p-4">
        <h1 className="mb-4 text-xl font-bold">Your Orders</h1>
        <div className="space-y-3">
          {trades.map(t => (
            <Link key={t.id} href={`/trade/${t.id}`} className="block rounded-lg border border-binance-border bg-binance-card p-4">
              <div className="flex justify-between">
                <p>{formatInr(t.amount)}</p>
                <p className="capitalize text-binance-yellow">{t.status}</p>
              </div>
              <p className="text-xs text-binance-textMuted">Created: {formatDateTime(t.createdAt)}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
