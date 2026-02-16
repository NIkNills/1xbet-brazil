# 1xBet Affiliate (pt-BR) — PRO (Next.js + Tailwind)

Inclui:
- GA4 + Meta Pixel (rastreamento de cliques em CTA)
- UTM automático nas URLs de afiliado
- Teste A/B (CTA variante A/B com cookie 30 dias)
- Feed de futebol via NewsAPI (opcional) + TheSportsDB com cache
- Estrutura multi-page para SEO: /bonus, /pix, /codigo-promocional
- SEO: sitemap.xml, robots.txt, OpenGraph image

## 1) Rodar localmente
```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## 2) Configurar Analytics
No `.env.local`:
- `NEXT_PUBLIC_GA4_ID` = seu Measurement ID (G-...)
- `NEXT_PUBLIC_META_PIXEL_ID` = seu Pixel ID

Eventos:
- GA4: `cta_click` com params `placement`, `variant`, `link_url`
- Meta Pixel: `CTA_Click` (trackCustom) com os mesmos params

## 3) UTM automático
Defaults:
- `NEXT_PUBLIC_UTM_SOURCE`, `NEXT_PUBLIC_UTM_MEDIUM`, `NEXT_PUBLIC_UTM_CAMPAIGN`
Se a página for acessada com `?utm_source=...`, esses valores sobrescrevem os defaults nos links de afiliado.

## 4) NewsAPI
Coloque `NEWSAPI_KEY` no `.env.local`.
Sem chave, o bloco de notícias mostra cards de fallback (o resto do feed funciona via TheSportsDB).

## 5) Deploy (Vercel)
- Suba o projeto no GitHub
- Importe no Vercel
- Configure as ENV vars no painel do Vercel (mesmas do .env.local)
- Deploy ✅

## 6) Deploy (VPS / Linux)
Pré-requisitos: Node.js 18+ (recomendado 20+)
```bash
npm install
npm run build
npm run start
```
Para produção, use um process manager (PM2/systemd) e um reverse proxy (Nginx) para HTTPS.

## Páginas SEO
- `/bonus`
- `/pix`
- `/codigo-promocional`
- `/privacidade`
- `/contato`

Sitemap: `/sitemap.xml`
Robots: `/robots.txt`
OpenGraph: `/opengraph-image`

## Segurança (IMPORTANTE)
- NÃO commite chaves no GitHub.
- Coloque `NEWSAPI_KEY` e `` apenas em `.env.local` (local) ou nas env vars do Vercel.

## Limites e cache
- `/api/football` usa `revalidate=600` (10 min).
- NewsAPI: 1 request/10 min.
- TheSportsDB: 2 requests/10 min (fixtures + statistics de 1 jogo).
- TheSportsDB: cache maior para tabela.


## v3 (sem RapidAPI)
- Removido RapidAPI (evita bloqueios 451 por região).
- Destaque/Resultados/Jogos/Tabela via TheSportsDB.
- News via NewsAPI com fallback (top-headlines BR → everything PT).
