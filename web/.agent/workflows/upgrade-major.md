---
description: Migração completa para Next.js 16, React 19 e Tailwind 4
---

# 🚀 Reset Técnico Core - Vasta Web

> **Objetivo:** Alinhar o Vasta com o stack moderno do ecossistema React/Next, reduzindo dívida técnica e preparando o projeto para escala.

---

## 📋 Pré-requisitos

### Ambiente Recomendado

```bash
node -v  # >= 20.x (LTS)
npm -v   # >= 10.x
```

### Verificar ambiente atual

```bash
// turbo
node -v && npm -v
```

### Backup obrigatório

```bash
git add -A && git commit -m "backup: pre-upgrade snapshot"
git push origin main
```

---

## Fase 1: Upgrade Core (Next.js 16 + React 19)

> ⚠️ **Atenção:** Next 16 assume React 19 internamente. Atualizar juntos evita estados intermediários instáveis.

### 1.1 Atualizar dependências core

```bash
// turbo
npm install next@latest react@latest react-dom@latest
npm install --save-dev @types/react@latest @types/react-dom@latest
```

### 1.2 Rodar codemod oficial

```bash
// turbo
npx @next/codemod@latest upgrade
```

### 1.3 Verificar next.config.js

- [ ] Remover opções `experimental` deprecadas
- [ ] Verificar `experimental_ppr` (removido/alterado)
- [ ] Definir estratégia Turbopack:

```js
// next.config.js - Se Turbopack causar problemas:
experimental: {
  turbo: false, // Forçar Webpack temporariamente
}
```

### 1.4 Auditar componentes com forwardRef

Priorizar componentes exportados:

- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/Input.tsx`
- [ ] `components/ui/Modal.tsx`
- [ ] `components/AuthModal.tsx`

> **Nota:** forwardRef muda inferência de tipos e pode quebrar libs antigas.

### 1.5 Testar build

```bash
// turbo
npm run build
```

### 1.6 Checkpoint

```bash
git add -A && git commit -m "chore: upgrade next 16 + react 19"
```

---

## Fase 2: Upgrade Tailwind CSS 4

> ⚠️ **FASE DE MAIOR RISCO VISUAL** - Tailwind 4 é a maior quebra do plano.

### 2.1 Atualizar dependências

```bash
// turbo
npm install tailwindcss@latest postcss@latest autoprefixer@latest
```

### 2.2 Rodar upgrade tool oficial

```bash
// turbo
npx @tailwindcss/upgrade
```

### 2.3 Mudanças principais a verificar

- [ ] **CSS-first config**: `tailwind.config.js` → CSS imports
- [ ] **Tokens de cor**: Sintaxe alterada
- [ ] **Dark mode**: Verificar funcionamento
- [ ] **Variantes de estado**: Sintaxe pode ter mudado

### 2.4 Limpar cache e testar

```bash
// turbo
Remove-Item -Recurse -Force .next
npm run dev
```

### 2.5 Validação visual obrigatória

Abrir no navegador e verificar:

- [ ] `/` (Home) - Layout, cores, responsivo
- [ ] `/dashboard` - Sidebar, cards, botões
- [ ] `/dashboard/aparencia` - Formulários, preview
- [ ] `/yorrany` (Página pública) - Tema dark/light, fontes

### 2.6 Checkpoint

```bash
git add -A && git commit -m "chore: upgrade tailwind v4"
```

---

## Fase 3: Correção de Vulnerabilidades

### 3.1 Auditoria inicial (sem force)

```bash
// turbo
npm audit
```

### 3.2 Correção segura

```bash
// turbo
npm audit fix
```

### 3.3 Verificar resultado

```bash
// turbo
npm audit
```

### 3.4 Se houver vulnerabilidades restantes

Avaliar **caso a caso** antes de usar `--force`:

```bash
npm audit fix --force  # ⚠️ Pode subir versões major
```

### 3.5 Checkpoint

```bash
git add -A && git commit -m "chore: fix security vulnerabilities"
```

---

## Fase 4: Validação Final

### 4.1 Build de produção

```bash
// turbo
npm run build
```

### 4.2 Verificar TypeScript

```bash
// turbo
npx tsc --noEmit
```

### 4.3 Smoke Test Manual

Executar fluxo completo:

- [ ] Fazer login (Google/Email)
- [ ] Acessar dashboard
- [ ] Alterar aparência (cor, fonte, tema)
- [ ] Selecionar imagem do Pexels
- [ ] Verificar página pública
- [ ] Fazer logout

### 4.4 Teste local final

```bash
// turbo
npm run dev
```

---

## Fase 5: Finalização

### 5.1 Atualizar engines no package.json

```json
"engines": {
  "node": ">=20.0.0",
  "npm": ">=10.0.0"
}
```

### 5.2 Criar .nvmrc

```bash
echo "20" > .nvmrc
```

### 5.3 Commit final

```bash
git add -A && git commit -m "chore: complete major stack upgrade"
git push origin main
```

---

## 🔄 Rollback por Fase

Se algo der errado, você pode voltar **apenas a fase problemática**:

```bash
# Ver commits recentes
git log --oneline -5

# Voltar fase específica
git revert <hash-do-commit>

# Ou voltar tudo ao backup inicial
git reset --hard <hash-do-backup>
npm install
```

---

## 📚 Referências

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [npm audit documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)

---

## ⏱️ Tempo Estimado

| Fase              | Tempo        |
| ----------------- | ------------ |
| Fase 1: Core      | 15-30 min    |
| Fase 2: Tailwind  | 30-60 min    |
| Fase 3: Security  | 10 min       |
| Fase 4: Validação | 20 min       |
| **Total**         | **~2 horas** |
