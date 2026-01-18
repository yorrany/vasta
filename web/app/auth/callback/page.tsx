'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') ?? '/dashboard';
      const errorDescription = searchParams.get('error_description');

      if (errorDescription) {
        setError(errorDescription);
        // Optional: Redirect to error page
        // router.push('/auth/auth-code-error');
        return;
      }

      if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          router.push(next);
        } else {
          setError(error.message);
          router.push('/auth/auth-code-error');
        }
      } else {
         // No code, maybe implicit flow or already logged in?
         // Just redirect to dashboard or home
         router.push('/dashboard');
      }
    };

    handleAuth();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro de Autenticação</h1>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Autenticando...</h1>
        <p className="mt-2 text-gray-500">Por favor, aguarde.</p>
      </div>
    </div>
  );
}
