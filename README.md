# Derycash Frontend

Interface web do Derycash, uma aplicacao de controle financeiro pessoal focada em mostrar a bufunfa livre real.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Auth.js / NextAuth
- Radix UI
- Lucide React
- Recharts
- Anime.js
- React Hook Form
- Zod
- Zustand

## Telas

```text
/                 Landing inicial
/login            Login com GitHub/Google
/onboarding       Perfil financeiro inicial
/dashboard        Meu Derycash
/contas           Contas fixas
/cartoes          Cartoes, compras e parcelas
/gastos           Gastos avulsos
/metas            Cofrinhos/metas
/posso-gastar     Simulador de compra
/investimentos    Simulador educativo de investimentos
```

## Fluxo principal

1. Usuario entra por `/login`.
2. Configura renda, dias de pagamento, meta e margem em `/onboarding`.
3. Cadastra contas, cartoes, compras, gastos e metas.
4. O dashboard calcula a bufunfa livre real considerando renda, contas, fatura, gastos, meta e margem.
5. O simulador "Posso Gastar?" mostra impacto e risco antes de uma compra.

## Ambiente

Copie `.env.example` para `.env.local`.

```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
AUTH_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Design

- Tema dark
- Linguagem brasileira e direta
- Cards de leitura rapida
- Estados vazios com personalidade
- Microinteracoes no dashboard com Anime.js

## Aviso financeiro

O Derycash nao fornece recomendacao financeira profissional. As informacoes exibidas sao educativas e servem para organizacao pessoal e simulacoes. Antes de investir, estude os produtos e considere seu perfil, objetivos e riscos.
