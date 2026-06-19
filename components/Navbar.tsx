'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Simple-G</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 space-y-2">
          <Link href="/#features" className="block py-2 text-sm text-gray-600">Features</Link>
          <Link href="/#pricing" className="block py-2 text-sm text-gray-600">Pricing</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="block py-2 text-sm text-gray-600">Dashboard</Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block py-2 text-sm text-gray-600 w-full text-left"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-sm text-gray-600">Log in</Link>
              <Link href="/register" className="block py-2 text-sm font-medium text-indigo-600">
                Get started free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
