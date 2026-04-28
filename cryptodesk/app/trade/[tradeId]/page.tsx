'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { db, storage } from '@/lib/firebase';
import { formatInr } from '@/lib/format';
import { Trade, TradeMessage } from '@/types';

// Trade room: status updates, proof uploads, disputes, and real-time chat.
export default function TradeDetailPage() {
  const params = useParams<{ tradeId: string }>();
  const tradeId = params.tradeId;
  const { user } = useAuth();

  const [trade, setTrade] = useState<Trade | null>(null);
  const [messages, setMessages] = useState<TradeMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [reason, setReason] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const unsubTrade = onSnapshot(doc(db, 'trades', tradeId), snap => {
      if (snap.exists()) {
        setTrade({ id: snap.id, ...(snap.data() as Omit<Trade, 'id'>) });
      }
    });

    const q = query(collection(db, 'trades', tradeId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubMessages = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<TradeMessage, 'id'>) })));
    });

    return () => {
      unsubTrade();
      unsubMessages();
    };
  }, [tradeId]);

  const remaining = useMemo(() => {
    if (!trade) return 0;
    return Math.max(0, Math.floor((trade.expiresAt - now) / 1000));
  }, [trade, now]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const sendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !chatInput.trim()) return;

    await addDoc(collection(db, 'trades', tradeId, 'messages'), {
      tradeId,
      senderId: user.uid,
      senderName: user.email || user.phoneNumber || 'Trader',
      message: chatInput,
      createdAt: Date.now(),
    });
    setChatInput('');
  };

  const markPaid = async () => updateDoc(doc(db, 'trades', tradeId), { status: 'paid' });
  const release = async () => updateDoc(doc(db, 'trades', tradeId), { status: 'completed' });

  const raiseDispute = async () => {
    if (!user || !reason.trim()) return;
    await addDoc(collection(db, 'disputes'), {
      tradeId,
      raisedBy: user.uid,
      reason,
      createdAt: Date.now(),
    });
    await updateDoc(doc(db, 'trades', tradeId), { status: 'disputed' });
    setReason('');
  };

  const uploadProof = async (file: File) => {
    const fileRef = ref(storage, `proofs/${tradeId}/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await updateDoc(doc(db, 'trades', tradeId), { proofUrl: url });
  };

  if (!trade) return <main className="p-6">Loading trade...</main>;

  return (
    <main>
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-[1.4fr,1fr]">
        <div className="space-y-4 rounded-xl border border-binance-border bg-binance-card p-4">
          <h1 className="text-xl font-semibold">Trade #{trade.id}</h1>
          <p>Amount: {formatInr(trade.amount)}</p>
          <p>Price: {formatInr(trade.price)}</p>
          <p>Status: <span className="capitalize text-binance-yellow">{trade.status}</span></p>
          <p>Payment instructions: Transfer amount via {trade.paymentMethod} and mark as paid.</p>
          <p>Time left: {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</p>

          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={markPaid}>I PAID</button>
            <button className="btn-secondary" onClick={release}>RELEASE</button>
          </div>

          <div>
            <label className="mb-1 block text-sm">Upload payment proof</label>
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadProof(e.target.files[0])} />
            {trade.proofUrl && <img src={trade.proofUrl} alt="Proof" className="mt-3 max-h-60 rounded-md border border-binance-border" />}
          </div>

          <div className="rounded-lg border border-red-700/40 bg-red-950/20 p-3">
            <h3 className="mb-2 text-sm font-semibold text-red-400">Raise dispute</h3>
            <textarea className="input min-h-20" value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe issue" />
            <button className="btn-secondary mt-2" onClick={raiseDispute}>Raise Dispute</button>
          </div>
        </div>

        <div className="rounded-xl border border-binance-border bg-binance-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Trade Chat</h2>
          <div className="mb-3 h-96 space-y-2 overflow-y-auto rounded-md border border-binance-border p-2">
            {messages.map(m => (
              <div key={m.id} className="rounded bg-black/30 p-2 text-sm">
                <p className="text-binance-yellow">{m.senderName}</p>
                <p>{m.message}</p>
                <p className="text-xs text-binance-textMuted">{new Date(m.createdAt).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="flex gap-2">
            <input className="input" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type message" />
            <button className="btn-primary" type="submit">Send</button>
          </form>
        </div>
      </section>
    </main>
  );
}
