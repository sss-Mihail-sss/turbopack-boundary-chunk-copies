'use client';

// A client component that only app/unauthorized.jsx renders.
export function SignInLink() {
  return <a href="/sign-in" onClick={() => console.log('sign in')}>Sign in</a>;
}
