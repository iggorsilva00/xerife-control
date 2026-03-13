# Xerife Control — Controle Financeiro

App de controle financeiro pessoal e empresarial, **100% offline**, que funciona como app nativo no celular via PWA.

---

## Deploy no GitHub + Vercel

### Passo 1 — Subir no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Crie um repositório com o nome `xerife-control` (pode ser privado)
3. **Não** marque "Add a README file"
4. Clique em **Create repository**

Depois, no terminal dentro da pasta `nextjs_space`:

```bash
git init
git add .
git commit -m "feat: xerife control inicial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/xerife-control.git
git push -u origin main
```

> Substitua `SEU_USUARIO` pelo seu usuário do GitHub.

---

### Passo 2 — Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `xerife-control`
4. Na tela de configuração:
   - **Framework Preset:** Next.js *(detectado automaticamente)*
   - **Root Directory:** `nextjs_space` *(importante! o código está nesta subpasta)*
   - **Build Command:** `yarn build`
   - **Install Command:** `yarn install`
5. Clique em **Deploy**

O Vercel vai buildar e publicar em ~2 minutos com URL tipo:
```
https://xerife-control.vercel.app
```

> Na tela do Vercel, certifique-se de definir o **Root Directory** como `nextjs_space`.

---

### Passo 3 — Instalar no celular (PWA)

**Android (Chrome):** banner aparece automaticamente → toque **Instalar**

**iPhone (Safari):** Compartilhar ⬆ → **Adicionar à Tela de Início**

Após instalar, o app funciona **100% offline**.

---

### Atualizações futuras

```bash
git add .
git commit -m "sua mensagem"
git push
# Vercel faz deploy automático
```

---

## Rodar localmente

```bash
cd nextjs_space
yarn install
yarn dev
# Acesse: http://localhost:3000
```

---

## Estrutura

```
nextjs_space/
├── app/                  # Páginas Next.js
├── components/
│   ├── dashboard/        # Dashboard + gráficos
│   ├── transactions/     # Lançamentos CRUD
│   ├── accounts/         # Contas e cartões
│   ├── goals/            # Metas financeiras
│   ├── notifications/    # Sino de notificações
│   ├── settings/         # Config + PDF + backup
│   ├── onboarding/       # Wizard de primeiro acesso
│   ├── auth/             # Tela de bloqueio PIN
│   └── pwa/              # Banner instalação PWA
├── lib/
│   ├── db/               # IndexedDB local (v2)
│   ├── services/         # Toda a lógica de negócio
│   ├── contexts/         # AuthContext · AppContext
│   └── types/            # Tipos TypeScript
└── public/
    ├── sw.js             # Service Worker
    ├── manifest.json     # Manifest PWA
    └── icons/            # Ícones 72→512px
```
