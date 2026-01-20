'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="px-4 py-2 bg-slate-700 rounded-lg">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
    >
      Sign In
    </button>
  );
}
