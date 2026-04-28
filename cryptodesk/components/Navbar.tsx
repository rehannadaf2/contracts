'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Buy' },
  { href: '/?tab=sell', label: 'Sell' },
  { href: '/orders', label: 'Orders' },
  { href: '/profile', label: 'Profile' },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-binance-border bg-binance-dark/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-black text-binance-yellow">
          Cryptodesk
        </Link>
        <ul className="flex gap-3 md:gap-6">
          {links.map(link => {
            const active = pathname === link.href || (link.href.includes('?tab=sell') && pathname === '/');
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`text-sm transition ${active ? 'text-binance-yellow' : 'text-binance-textMuted hover:text-white'}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};
