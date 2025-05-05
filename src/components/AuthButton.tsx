'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <Button variant="secondary" disabled>
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-foreground">
            {session.user?.name}
          </span>
        </div>
        <Button
          variant="destructive"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn('google')}
    >
      Sign in
    </Button>
  );
}
