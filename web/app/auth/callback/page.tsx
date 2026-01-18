'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (ranOnce.current) return;
      ranOnce.current = true;

      const code = searchParams.get('code');
      const next = searchParams.get('next') ?? '/dashboard';
      const errorDescription = searchParams.get('error_description');

      if (errorDescription) {
        setError(errorDescription);
        return;
      }

      if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          router.push(next);
        } else {
          console.error('Auth error:', error);
          setError("Não foi possível validar seu acesso. Isso pode acontecer se o link expirou ou se houve uma falha na comunicação."); 
          // Use a generic message or error.message depending on what you want to show
        }
      } else {
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
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-vasta-primary text-white rounded-md hover:bg-vasta-primary/90"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Autenticando...</h1>
        <p className="mt-2 text-gray-500">Por favor, aguarde enquanto validamos seu acesso.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Carregando...</h1>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
