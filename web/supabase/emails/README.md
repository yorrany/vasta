# Templates de E-mail Supabase para Vasta

Este diretório contém os templates de e-mail HTML personalizados para as notificações de autenticação e segurança do Vasta, todos traduzidos para Português (PT-BR).

## Como Usar

### 1. E-mails de Autenticação Padrão

Copie o conteúdo dos arquivos abaixo para a seção **Supabase Dashboard > Authentication > Email Templates**:

- **Confirm Signup (Confirmação de Cadastro)**: `confirm_signup.html`
- **Invite User (Convite de Usuário)**: `invite_user.html`
- **Magic Link (Link Mágico)**: `magic_link.html`
- **Change Email Address (Alteração de E-mail)**: `change_email.html`
- **Reset Password (Redefinição de Senha)**: `reset_password.html`
- **Reauthentication (Reautenticação)**: `reauthentication.html` (Nota: Verifique as configurações de reautenticação no Supabase)

### 2. Notificações de Segurança

Atualmente, o Supabase não suporta a configuração direta desses templates na interface do Dashboard. Você precisará enviá-los usando um serviço de e-mail personalizado (ex: Resend, SendGrid) acionado por Webhooks do Banco de Dados ou Edge Functions quando eventos específicos ocorrerem (ex: inserção em `audit_logs` ou atualização em `auth.users`).

Arquivos fornecidos para integração:

- `password_changed.html` (Senha alterada)
- `email_changed.html` (E-mail alterado)
- `phone_changed.html` (Telefone alterado)
- `identity_linked.html` (Identidade vinculada)
- `identity_unlinked.html` (Identidade desvinculada)
- `mfa_added.html` (MFA adicionado)
- `mfa_removed.html` (MFA removido)

## Notas de Design

- **Logo**: Configurado para usar `https://vasta.pro/logo.svg`. Certifique-se de que este arquivo existe e é acessível publicamente.
- **Cores**:
  - Botão Primário: `#6366f1` (Indigo-500)
  - Fundo: `#fafaf9` (Stone-50)
  - Fundo do Card: `#ffffff`
  - Texto: `#1c1917` (Stone-900)
- **Responsividade**: Templates usam layout de coluna única com largura máxima de 500px, compatível com dispositivos móveis.

## Variáveis

Variáveis padrão do Supabase utilizadas:

- `{{ .ConfirmationURL }}`
- `{{ .InviteURL }}`
- `{{ .Token }}`

Variáveis personalizadas usadas nos templates de Segurança (precisam ser implementadas no seu disparador de e-mail):

- `{{ .Time }}`
- `{{ .Location }}`
- `{{ .Email }}`
- `{{ .Provider }}`
