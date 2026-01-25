-- Adicionar colunas relacionadas ao Stripe na tabela profiles
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas se ainda não existirem
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS plan_code TEXT DEFAULT 'start';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
ON profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_plan_code 
ON profiles(plan_code);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
ON profiles(subscription_status);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN profiles.stripe_customer_id IS 'ID do customer no Stripe';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'ID da assinatura ativa no Stripe';
COMMENT ON COLUMN profiles.subscription_status IS 'Status da assinatura: active, past_due, canceled, etc';
COMMENT ON COLUMN profiles.plan_code IS 'Código do plano: start, pro, business';
