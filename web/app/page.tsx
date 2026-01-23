import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Vasta Pro - Centralize Seus Links em Uma Página Profissional',
  description: 'Plataforma SaaS de bio links para criadores de conteúdo, influenciadores e empreendedores. Integre Instagram, personalize sua página e gerencie todos os seus links em um só lugar.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">Vasta Pro</span>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/privacy" className="text-slate-600 hover:text-slate-900 transition-colors">
                Privacidade
              </Link>
              <Link href="/terms" className="text-slate-600 hover:text-slate-900 transition-colors">
                Termos
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Entrar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Centralize Seus Links em
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                Uma Página Profissional
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Plataforma SaaS de bio links para criadores de conteúdo, influenciadores e empreendedores.
              Integre Instagram, personalize sua página e gerencie todos os seus links em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Começar Gratuitamente
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-slate-50 transition-all font-semibold text-lg border-2 border-blue-600"
              >
                Ver Recursos
              </a>
            </div>
          </div>

          {/* Preview Image Placeholder */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-2xl p-8 border border-slate-300">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full"></div>
                  <div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    <div className="h-3 w-24 bg-slate-100 rounded mt-2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg"></div>
                  <div className="h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg"></div>
                  <div className="h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Recursos Poderosos para Criadores
            </h2>
            <p className="text-xl text-slate-600">
              Tudo que você precisa para gerenciar sua presença online profissionalmente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Landing Page Personalizada</h3>
              <p className="text-slate-600">
                Crie uma página única e profissional com seu próprio domínio. Personalize cores, fontes e layout.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Integração com Instagram</h3>
              <p className="text-slate-600">
                Conecte sua conta Instagram Business e exiba automaticamente seu feed e informações profissionais.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gerenciamento de Links</h3>
              <p className="text-slate-600">
                Adicione, edite e organize quantos links quiser. Direcione seu público para onde importa.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Análises e Estatísticas</h3>
              <p className="text-slate-600">
                Acompanhe visualizações, cliques e engajamento com painéis analíticos detalhados.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-100">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">100% Responsivo</h3>
              <p className="text-slate-600">
                Sua página fica perfeita em qualquer dispositivo: desktop, tablet ou smartphone.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-100">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Segurança e Privacidade</h3>
              <p className="text-slate-600">
                Seus dados são protegidos com criptografia SSL/TLS. Conformidade total com LGPD e GDPR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-slate-600">
              Comece em minutos, sem conhecimento técnico necessário
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Crie Sua Conta</h3>
              <p className="text-slate-600">
                Cadastre-se gratuitamente em segundos usando email ou redes sociais.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Personalize</h3>
              <p className="text-slate-600">
                Escolha seu tema, adicione links e conecte suas redes sociais.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Compartilhe</h3>
              <p className="text-slate-600">
                Copie seu link único e compartilhe em suas redes. Pronto!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Usage Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 md:p-12 rounded-2xl border border-blue-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Como Usamos Seus Dados
            </h2>
            <div className="space-y-4 text-slate-700">
              <p className="leading-relaxed">
                <strong>Quando você conecta sua conta Instagram Business ao Vasta Pro</strong>, solicitamos
                permissão para acessar informações básicas do seu perfil profissional através da permissão
                <code className="bg-blue-100 px-2 py-1 rounded text-sm font-mono">instagram_business_basic</code>.
              </p>

              <p className="leading-relaxed">
                <strong>Coletamos apenas:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Nome de usuário (@username)</li>
                <li>Foto de perfil</li>
                <li>Nome da conta</li>
                <li>ID da conta (para identificação técnica)</li>
              </ul>

              <p className="leading-relaxed">
                <strong>Esses dados são usados exclusivamente para:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Exibir informações autênticas do seu Instagram em sua landing page</li>
                <li>Permitir que visitantes vejam seu perfil profissional integrado</li>
                <li>Melhorar a credibilidade e profissionalismo da sua página</li>
              </ul>

              <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600">
                  🔒 <strong>Segurança garantida:</strong> Não armazenamos suas fotos. Não vendemos dados.
                  Não usamos para publicidade. Você pode desconectar a qualquer momento.
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Leia nossa Política de Privacidade completa →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de criadores que já usam o Vasta Pro
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold text-lg shadow-xl"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">V</span>
                </div>
                <span className="text-xl font-bold">Vasta Pro</span>
              </div>
              <p className="text-slate-400 text-sm">
                Centralize seus links em uma página profissional
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Preços</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Termos de Serviço</Link></li>
                <li><Link href="/data-deletion/status" className="hover:text-white transition-colors">Exclusão de Dados</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="mailto:support@vasta.pro" className="hover:text-white transition-colors">support@vasta.pro</a></li>
                <li><a href="mailto:privacy@vasta.pro" className="hover:text-white transition-colors">privacy@vasta.pro</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2026 YORRANY MARTINS BRAGA LTDA - Vasta Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
