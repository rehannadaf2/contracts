'use client';

import { AuthCard } from '@/components/AuthCard';
import { CreateAdForm } from '@/components/CreateAdForm';
import { MarketplaceTable } from '@/components/MarketplaceTable';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <main className="p-8 text-center">Loading...</main>;

  return (
    <main className="min-h-screen bg-binance-dark">
      <Navbar />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:grid-cols-[2fr,1fr]">
        {!user ? (
          <div className="md:col-span-2">
            <AuthCard />
          </div>
        ) : (
          <>
            <MarketplaceTable />
            <CreateAdForm />
          </>
        )}
      </div>
    </main>
  );
}
