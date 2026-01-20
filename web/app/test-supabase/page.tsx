"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function TestSupabasePage() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        async function checkConnection() {
            try {
                const supabase = createClient();

                // Verificar URL e Key (apenas se existem, não mostrar valores sensíveis completos)
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                if (!url || !key) {
                    throw new Error("Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas.");
                }

                // Tentar uma consulta simples. Mesmo se a tabela estiver vazia, não deve dar erro de conexão.
                // Usamos count para ser leve.
                const { data, error, count } = await supabase
                    .from("profiles")
                    .select("*", { count: "exact", head: true });

                if (error) {
                    // Se o erro for de tabela não existente (404 ou 42P01), ainda assim conectou no banco, mas a estrutura tá errada.
                    // Mas para teste de "conexão", qualquer resposta do servidor é um sinal de vida.
                    // Porém, queremos saber se está *corretamente* configurado, então erro de tabela é um problema.
                    throw error;
                }

                setStatus("success");
                setMessage("Conexão com Supabase estabelecida com sucesso!");
                setDetails({
                    urlConfigurada: url,
                    tabelaProfiles: "Acessível",
                    registrosEncontrados: count
                });

            } catch (err: any) {
                setStatus("error");
                setMessage(err.message || "Erro desconhecido ao conectar");
                setDetails(err);
            }
        }

        checkConnection();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Teste de Conexão Supabase</h1>

                <div className={`p-6 rounded-xl border ${status === 'loading' ? 'bg-blue-500/10 border-blue-500/50' :
                        status === 'success' ? 'bg-emerald-500/10 border-emerald-500/50' :
                            'bg-red-500/10 border-red-500/50'
                    }`}>
                    <h2 className="text-xl font-semibold mb-2">
                        {status === 'loading' && "Testando conexão..."}
                        {status === 'success' && "Conectado!"}
                        {status === 'error' && "Falha na conexão"}
                    </h2>
                    <p className="text-slate-300">{message}</p>
                </div>

                {details && (
                    <div className="bg-slate-900 p-4 rounded-lg overflow-auto">
                        <pre className="text-xs text-slate-400">
                            {JSON.stringify(details, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="text-sm text-slate-500">
                    <p>Verifique se as variáveis de ambiente estão configuradas corretamente no arquivo <code>.env.local</code></p>
                </div>
            </div>
        </div>
    );
}
