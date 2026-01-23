import type { Metadata } from 'next'
import { LegalLayout, LegalSection, LegalSubsection, LegalFeatureBox } from '@/components/LegalLayout'

export const metadata: Metadata = {
    title: 'Política de Privacidade | Vasta Pro',
    description: 'Como o Vasta Pro protege e utiliza seus dados pessoais',
}

export default function PrivacyPage() {
    return (
        <LegalLayout
            title="Política de Privacidade"
            description="Como coletamos, usamos e protegemos seus dados pessoais"
            lastUpdated="23 de janeiro de 2026"
        >
            <LegalSection title="1. Introdução">
                <p>
                    A <strong>YORRANY MARTINS BRAGA LTDA</strong>, CNPJ nº 63.839.428/0001-04, proprietária do <strong>Vasta Pro</strong>, está comprometida em proteger sua privacidade. Esta política descreve como tratamos seus dados de acordo com a LGPD (Lei 13.709/2018) e GDPR.
                </p>
            </LegalSection>

            <LegalSection title="2. Dados Coletados">
                <LegalSubsection title="2.1 Informações Fornecidas por Você">
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Cadastro:</strong> Nome, email, senha, username</li>
                        <li><strong>Perfil:</strong> Foto, biografia, links, informações profissionais</li>
                        <li><strong>Pagamento:</strong> Processados por terceiros (não armazenamos cartões)</li>
                    </ul>
                </LegalSubsection>

                <LegalSubsection title="2.2 Dados de Integrações">
                    <LegalFeatureBox variant="primary" title="Instagram Business">
                        <p>Com sua autorização, coletamos:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                            <li>Nome de usuário (@username)</li>
                            <li>Foto de perfil (URL pública)</li>
                            <li>Nome da conta</li>
                            <li>ID da conta (identificação técnica)</li>
                        </ul>
                        <p className="text-sm mt-2">
                            Permissão utilizada: <code className="text-xs bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded">instagram_business_basic</code>
                        </p>
                    </LegalFeatureBox>
                </LegalSubsection>

                <LegalSubsection title="2.3 Dados Coletados Automaticamente">
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Endereço IP, navegador, sistema operacional</li>
                        <li>Páginas visitadas e tempo de sessão</li>
                        <li>Cookies para autenticação e preferências</li>
                    </ul>
                </LegalSubsection>
            </LegalSection>

            <LegalSection title="3. Finalidade do Tratamento">
                <p>Usamos seus dados para:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <LegalFeatureBox variant="success">
                        <strong className="text-emerald-700 dark:text-emerald-400">✓ Fornecer o Serviço</strong>
                        <p className="text-sm">Criar e gerenciar sua landing page profissional</p>
                    </LegalFeatureBox>
                    <LegalFeatureBox variant="success">
                        <strong className="text-emerald-700 dark:text-emerald-400">✓ Processar Pagamentos</strong>
                        <p className="text-sm">Gerenciar assinaturas e cobranças</p>
                    </LegalFeatureBox>
                    <LegalFeatureBox variant="success">
                        <strong className="text-emerald-700 dark:text-emerald-400">✓ Exibir Conteúdo</strong>
                        <p className="text-sm">Integrar dados do Instagram em sua página</p>
                    </LegalFeatureBox>
                    <LegalFeatureBox variant="success">
                        <strong className="text-emerald-700 dark:text-emerald-400">✓ Melhorias</strong>
                        <p className="text-sm">Análises agregadas para aprimorar o produto</p>
                    </LegalFeatureBox>
                </div>
            </LegalSection>

            <LegalSection title="4. Base Legal (LGPD)">
                <ul className="space-y-2">
                    <li>• <strong>Consentimento:</strong> Integrações com redes sociais</li>
                    <li>• <strong>Execução de Contrato:</strong> Fornecimento do serviço</li>
                    <li>• <strong>Legítimo Interesse:</strong> Segurança e melhorias</li>
                    <li>• <strong>Obrigação Legal:</strong> Cumprimento fiscal e regulatório</li>
                </ul>
            </LegalSection>

            <LegalSection title="5. Compartilhamento de Dados">
                <LegalFeatureBox variant="primary" title="Processadores de Dados (Sub-contratados)">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><strong>Supabase:</strong> Banco de dados e autenticação</li>
                        <li><strong>Vercel:</strong> Hospedagem da aplicação</li>
                        <li><strong>Stripe/AbacatePay:</strong> Processamento de pagamentos</li>
                        <li><strong>Cloudflare:</strong> Segurança e CDN</li>
                    </ul>
                </LegalFeatureBox>

                <LegalFeatureBox variant="warning" title="⚠️ Importante">
                    <p className="text-sm">
                        <strong>Não vendemos, alugamos ou compartilhamos seus dados</strong> com terceiros para marketing sem seu consentimento explícito.
                    </p>
                </LegalFeatureBox>
            </LegalSection>

            <LegalSection title="6. Segurança">
                <p>Implementamos medidas técnicas e organizacionais:</p>
                <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            🔒
                        </div>
                        <div>
                            <strong className="text-vasta-text">Criptografia SSL/TLS</strong>
                            <p className="text-sm text-vasta-muted">Dados em trânsito protegidos</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            🛡️
                        </div>
                        <div>
                            <strong className="text-vasta-text">Criptografia em Repouso</strong>
                            <p className="text-sm text-vasta-muted">Banco de dados protegido</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            👥
                        </div>
                        <div>
                            <strong className="text-vasta-text">Controle de Acesso</strong>
                            <p className="text-sm text-vasta-muted">Apenas pessoal autorizado</p>
                        </div>
                    </div>
                </div>
            </LegalSection>

            <LegalSection title="7. Seus Direitos (LGPD)">
                <p className="mb-4">Você tem direito a:</p>
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                        <span className="text-vasta-primary">✓</span>
                        <span><strong>Confirmação e acesso</strong> aos seus dados</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-vasta-primary">✓</span>
                        <span><strong>Correção</strong> de dados incompletos</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-vasta-primary">✓</span>
                        <span><strong>Anonimização ou exclusão</strong> de dados</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-vasta-primary">✓</span>
                        <span><strong>Portabilidade</strong> para outro fornecedor</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-vasta-primary">✓</span>
                        <span><strong>Revogação do consentimento</strong> a qualquer momento</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-vasta-primary">✓</span>
                        <span><strong>Informações sobre compartilhamento</strong></span>
                    </div>
                </div>

                <LegalFeatureBox variant="accent" title="Como Exercer Seus Direitos">
                    <p className="text-sm">
                        Entre em contato através de: <strong>privacy@vasta.pro</strong>
                    </p>
                </LegalFeatureBox>
            </LegalSection>

            <LegalSection title="8. Retenção de Dados">
                <p>
                    Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para cumprir obrigações legais (ex: dados fiscais por 5 anos).
                </p>
                <p>
                    Ao solicitar exclusão da conta, removemos seus dados em até <strong>30 dias</strong>, exceto os que devemos manter por lei.
                </p>
            </LegalSection>

            <LegalSection title="9. Cookies">
                <p>
                    Utilizamos cookies essenciais para autenticação e preferências. Você pode gerenciar cookies nas configurações do navegador.
                </p>
            </LegalSection>

            <LegalSection title="10. Alterações">
                <p>
                    Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas por email ou aviso na plataforma.
                </p>
            </LegalSection>

            <LegalSection title="11. Contato">
                <LegalFeatureBox variant="primary">
                    <div className="space-y-2 text-sm">
                        <p><strong>Empresa:</strong> YORRANY MARTINS BRAGA LTDA</p>
                        <p><strong>CNPJ:</strong> 63.839.428/0001-04</p>
                        <p><strong>Email de Privacidade:</strong> <a href="mailto:privacy@vasta.pro" className="text-indigo-600 dark:text-indigo-400 hover:underline">privacy@vasta.pro</a></p>
                        <p><strong>Encarregado de Dados (DPO):</strong> privacy@vasta.pro</p>
                        <p><strong>Website:</strong> https://vasta.pro</p>
                    </div>
                </LegalFeatureBox>

                <p className="mt-4">
                    Você também pode registrar reclamações junto à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-vasta-primary hover:underline">www.gov.br/anpd</a>
                </p>
            </LegalSection>
        </LegalLayout>
    )
}
