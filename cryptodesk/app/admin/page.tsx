'use client';

import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { Trade } from '@/types';
import { formatInr } from '@/lib/format';

// Admin-only control panel to resolve disputes and force trade outcomes.
export default function AdminPage() {
  const { profile } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [disputes, setDisputes] = useState<{ id: string; tradeId: string; reason: string }[]>([]);

  useEffect(() => {
    const unsubTrades = onSnapshot(query(collection(db, 'trades'), orderBy('createdAt', 'desc')), snap => {
      setTrades(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Trade, 'id'>) })));
    });

    const unsubDisputes = onSnapshot(collection(db, 'disputes'), snap => {
      setDisputes(snap.docs.map(d => ({ id: d.id, ...(d.data() as { tradeId: string; reason: string }) })));
    });

    return () => {
      unsubTrades();
      unsubDisputes();
    };
  }, []);

  if (profile?.role !== 'admin') {
    return (
      <main>
        <Navbar />
        <section className="mx-auto max-w-xl p-6 text-center text-red-400">Unauthorized: admin only.</section>
      </main>
    );
  }

  const releaseToBuyer = async (id: string) => updateDoc(doc(db, 'trades', id), { status: 'completed' });
  const refundSeller = async (id: string) => updateDoc(doc(db, 'trades', id), { status: 'pending' });

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-7xl space-y-5 p-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>

        <div className="rounded-lg border border-binance-border bg-binance-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Disputes</h2>
          {disputes.map(d => (
            <div key={d.id} className="mb-2 rounded border border-red-700/40 bg-red-950/20 p-2 text-sm">
              <p>Trade: {d.tradeId}</p>
              <p>Reason: {d.reason}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-binance-border bg-binance-card p-4">
          <h2 className="mb-3 text-lg font-semibold">All Trades</h2>
          <div className="space-y-3">
            {trades.map(t => (
              <div key={t.id} className="rounded border border-binance-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>
                    {t.id} · {formatInr(t.amount)} · <span className="capitalize text-binance-yellow">{t.status}</span>
                  </p>
                  <div className="flex gap-2">
                    <button className="btn-primary" onClick={() => releaseToBuyer(t.id)}>Release to buyer</button>
                    <button className="btn-secondary" onClick={() => refundSeller(t.id)}>Refund seller</button>
                  </div>
                </div>
                {t.proofUrl && <a href={t.proofUrl} className="mt-2 block text-sm text-binance-yellow underline">View payment proof</a>}
                <a href={`/trade/${t.id}`} className="text-xs text-binance-textMuted underline">Open chat history</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
