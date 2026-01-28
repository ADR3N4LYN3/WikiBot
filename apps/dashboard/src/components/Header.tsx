'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { ServerSelector } from './ServerSelector';

interface HeaderProps {
  user: any;
}

export function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-card border-b px-6 flex items-center justify-between">
      <ServerSelector />

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
              {user?.name?.[0] || 'U'}
            </div>
          )}
          <span className="font-medium">{user?.name || 'User'}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-lg shadow-lg py-1 z-20">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
