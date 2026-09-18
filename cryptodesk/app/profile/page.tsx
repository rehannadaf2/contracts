'use client';

import { signOut } from 'firebase/auth';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';

export default function ProfilePage() {
  const { user, profile } = useAuth();

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-3xl p-4">
        <div className="rounded-xl border border-binance-border bg-binance-card p-5">
          <h1 className="mb-4 text-xl font-semibold">Profile</h1>
          <div className="space-y-1 text-sm">
            <p>UID: {user?.uid}</p>
            <p>Email: {user?.email || '-'}</p>
            <p>Phone: {user?.phoneNumber || '-'}</p>
            <p>Role: {profile?.role || 'user'}</p>
          </div>
          <button className="btn-secondary mt-4" onClick={() => signOut(auth)}>
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
