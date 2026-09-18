'use client';

import { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Ad } from '@/types';
import { formatInr } from '@/lib/format';

export const MarketplaceTable = () => {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const tab = (searchParams.get('tab') || 'buy').toLowerCase() === 'sell' ? 'sell' : 'buy';

  // Subscribe to live ads so table refreshes in real time.
  useEffect(() => {
    const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snapshot => {
      const nextAds: Ad[] = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Ad, 'id'>) }));
      setAds(nextAds.filter(ad => ad.active));
    });
    return () => unsub();
  }, []);

  const filtered = ads.filter(ad => ad.side === tab);

  const startTrade = async (ad: Ad) => {
    if (!user) return;

    const buyerId = tab === 'buy' ? user.uid : ad.ownerId;
    const sellerId = tab === 'buy' ? ad.ownerId : user.uid;

    const trade = await addDoc(collection(db, 'trades'), {
      adId: ad.id,
      buyerId,
      sellerId,
      amount: ad.minLimit,
      price: ad.price,
      paymentMethod: ad.paymentMethod,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    router.push(`/trade/${trade.id}`);
  };

  return (
    <section className="rounded-xl border border-binance-border bg-binance-card p-4">
      <div className="mb-3 flex gap-2">
        {['buy', 'sell'].map(t => (
          <button
            key={t}
            onClick={() => router.push(`/?tab=${t}`)}
            className={`rounded-md px-4 py-2 text-sm font-semibold uppercase ${
              t === tab ? 'bg-binance-yellow text-black' : 'bg-binance-dark text-binance-textMuted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-binance-textMuted">
            <tr>
              <th className="p-3">Seller</th>
              <th className="p-3">Price</th>
              <th className="p-3">Limits</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ad => (
              <tr key={ad.id} className="border-t border-binance-border hover:bg-black/20">
                <td className="p-3">{ad.ownerName}</td>
                <td className="p-3 font-semibold text-binance-yellow">{formatInr(ad.price)}</td>
                <td className="p-3">
                  {formatInr(ad.minLimit)} - {formatInr(ad.maxLimit)}
                </td>
                <td className="p-3">{ad.paymentMethod}</td>
                <td className="p-3">
                  <button className="btn-primary" onClick={() => startTrade(ad)}>
                    {tab === 'buy' ? 'BUY' : 'SELL'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
