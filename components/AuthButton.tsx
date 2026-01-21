'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

type AuthButtonProps = {
  locale?: 'en' | 'zh';
};

const labels = {
  en: {
    loading: 'Loading...',
    signOut: 'Sign Out',
    signIn: 'Sign In',
  },
  zh: {
    loading: '加载中...',
    signOut: '退出',
    signIn: '登录',
  },
} as const;

export function AuthButton({ locale = 'en' }: AuthButtonProps) {
  const { data: session, status } = useSession();
  const labelClasses = locale === 'zh' ? 'tracking-normal' : 'uppercase tracking-[0.18em]';
  const baseClasses =
    `inline-flex items-center justify-center rounded-full border px-4 py-2 text-[11px] font-semibold transition ${labelClasses}`;
  const text = labels[locale];

  if (status === 'loading') {
    return (
      <div className={`${baseClasses} border-emerald-700/60 bg-emerald-900/50 text-emerald-100/70`}>
        {text.loading}
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="hidden md:inline text-xs text-emerald-100/70">
          {session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className={`${baseClasses} border-emerald-600/60 bg-emerald-800/70 text-amber-100 hover:bg-emerald-700`}
        >
          {text.signOut}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className={`${baseClasses} border-amber-300/70 bg-amber-300/20 text-amber-100 hover:bg-amber-300/30`}
    >
      {text.signIn}
    </button>
  );
}
