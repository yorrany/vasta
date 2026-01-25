# Configuração do Stripe para Vasta

Este guia explica como configurar a integração com Stripe para ativar assinaturas no Vasta.

## 📋 Pré-requisitos

1. Conta no Stripe (https://dashboard.stripe.com)
2. Acesso ao dashboard do Stripe em modo de teste

## 🔑 Passo 1: Obter as Chaves da API

1. Acesse https://dashboard.stripe.com/test/apikeys
2. Copie a **Publishable key** (começa com `pk_test_`)
3. Copie a **Secret key** (começa com `sk_test_`)
4. Atualize o arquivo `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
```

## 💳 Passo 2: Criar Produtos e Preços no Stripe

### Criar Produto Pro

1. Acesse https://dashboard.stripe.com/test/products
2. Clique em **"+ Create product"**
3. Configure:
   - **Name**: `Vasta Pro`
   - **Description**: `Plano Pro do Vasta com recursos avançados`
   - **Pricing**:
     - Recurring
     - **Monthly**: R$ 49,00 BRL
     - **Yearly**: R$ 38,00 BRL (optar por criar após)
4. Clique em **"Save product"**
5. Copie o **Price ID** do preço mensal (começa com `price_`)
6. Repita para criar o preço anual

### Criar Produto Business

1. Repita o processo acima com:
   - **Name**: `Vasta Business`
   - **Description**: `Plano Business do Vasta com recursos ilimitados`
   - **Monthly**: R$ 99,00 BRL
   - **Yearly**: R$ 87,00 BRL

### Atualizar .env.local

Após criar os produtos, atualize o `.env.local` com os Price IDs:

```bash
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_YEARLY=price_xxxxxxxxxxxxx
```

## 🗄️ Passo 3: Atualizar Schema do Supabase

Adicione as seguintes colunas à tabela `profiles`:

```sql
-- Adicionar colunas relacionadas ao Stripe
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS plan_code TEXT DEFAULT 'start';

-- Criar índice para busca rápida por customer_id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
ON profiles(stripe_customer_id);
```

## 🔄 Passo 4: Configurar Webhooks (Opcional mas Recomendado)

Para sincronizar automaticamente mudanças de status de assinatura:

1. Acesse https://dashboard.stripe.com/test/webhooks
2. Clique em **"Add endpoint"**
3. Configure:
   - **Endpoint URL**: `https://suaapp.com/api/webhooks/stripe`
   - **Events to send**:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
4. Copie o **Webhook signing secret** (começa com `whsec_`)
5. Adicione ao `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_aqui
```

## ✅ Passo 5: Testar a Integração

### Cartões de Teste

Use estes cartões para testar:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Qualquer data futura e qualquer CVV de 3 dígitos funcionam.

### Fluxo de Teste

1. Abra a aplicação e vá para a seção de planos
2. Clique em "Criar minha loja" em um plano pago
3. Faça login ou crie uma conta
4. Complete o checkout com um cartão de teste
5. Verifique se:
   - O pagamento foi processado
   - O usuário foi redirecionado para o dashboard
   - O plano foi atualizado no perfil

## 🚀 Produção

Para mover para produção:

1. Mude as chaves de teste para chaves de produção
2. Crie os mesmos produtos no modo **live** do Stripe
3. Atualize os Price IDs com os IDs de produção
4. Configure webhooks em produção
5. Teste completamente antes de lançar

## 📚 Recursos Adicionais

- [Documentação do Stripe](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Testar Integrações](https://stripe.com/docs/testing)
- [Webhooks do Stripe](https://stripe.com/docs/webhooks)

## ⚠️ Notas Importantes

- **Nunca** commite chaves secretas no Git
- Use variáveis de ambiente para todas as chaves
- Teste extensivamente em modo de teste antes de produção
- Monitore webhooks e erros no dashboard do Stripe
