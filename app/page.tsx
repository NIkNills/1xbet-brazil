import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  Flame,
  ShieldCheck,
  Zap,
  Star,
  Wallet,
  } from "lucide-react";
import FootballFeed from "@/components/FootballFeed";
import FAQSchema from "@/components/FAQSchema";
import ReviewSchema from "@/components/ReviewSchema";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { getCtaVariant } from "@/lib/affiliate";

const bonuses = [
  {
    title: "Bônus de Boas-Vindas",
    desc: "Até 100% no primeiro depósito (limite promocional).",
    terms: ["Depósito mínimo pode variar", "Regras de rollover aplicáveis", "Disponível para novos usuários"],
  },
  {
    title: "Cashback",
    desc: "Receba parte das perdas de volta em apostas elegíveis.",
    terms: ["Percentual por campanha", "Elegibilidade por esportes/mercados", "Período de cálculo definido"],
  },
  {
    title: "Freebet",
    desc: "Apostas grátis em jogos selecionados (tempo limitado).",
    terms: ["Uso em mercados específicos", "Prêmio depende de odds mínimas", "Prazos de ativação/uso"],
  },
  {
    title: "Bônus por Depósito",
    desc: "Ofertas recorrentes para depósitos e recargas.",
    terms: ["Pode exigir código", "Disponível em campanhas", "Limites por usuário"],
  },
];

const faq = [
  { q: "Como receber o bônus na 1xBet?", a: "Crie sua conta, confirme seus dados, insira o código promocional (se aplicável), faça um depósito qualificado e ative a oferta na área de bônus." },
  { q: "Qual é o depósito mínimo?", a: "O valor mínimo depende do método de pagamento e da campanha ativa. Verifique o limite exibido no caixa antes de confirmar." },
  { q: "Posso sacar o bônus imediatamente?", a: "Normalmente é necessário cumprir requisitos de aposta (rollover) antes do saque de valores bônus. Leia os termos de cada oferta." },
  { q: "A 1xBet é legal no Brasil?", a: "As regras podem mudar e variam por jurisdição. Recomendamos verificar a legislação local e usar apenas plataformas conforme as normas aplicáveis." },
];

export default function Page() {
  const affiliateUrl = process.env.NEXT_PUBLIC_AFFILIATE_URL || "https://your-aff-link.example/";
  const variant = getCtaVariant();

  return (
    <>
      <FAQSchema faq={faq} />
      <ReviewSchema />

      <main className="min-h-screen bg-[#070A12] bg-hero-glow">
        <SiteHeader affiliateUrl={affiliateUrl} variant={variant} />

        {/* Hero */}
        <section id="topo" className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/hero-stadium.jpg"
              alt="Estádio de futebol com luzes e atmosfera dinâmica"
              fill
              priority
              className="object-cover opacity-35"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-[#070A12]/70 to-[#070A12]" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pt-12 pb-10 md:pt-20 md:pb-16">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">Oferta por tempo limitado — aproveite hoje
                </div>

                <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
                  Bônus 100% até <span className="text-cyan-300">R$6000</span> na{" "}
                  <span className="text-emerald-300">1xBet</span>
                </h1>

                <p className="mt-4 text-zinc-300 max-w-xl">
                  Guia afiliado em português (Brasil) com os principais bônus, condições,
                  pagamentos locais (PIX) e dicas para começar em apostas de futebol com mais vantagem.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <CTAButton
                    baseUrl={affiliateUrl}
                    variant={variant}
                    placement="hero_primary"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 transition shadow-neon animate-pulseGlow"
                  >
                    {variant === "A" ? "Receber Bônus Agora" : "Ativar Bônus e Apostar"}
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition" />
                  </CTAButton>

                  <a
                    href="#bonus"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition"
                  >
                    Ver ofertas <ChevronRight className="h-5 w-5" />
                  </a>
                </div>

                <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-200">
                  {[
                    "Foco em futebol (pré-jogo e ao vivo)",
                    "Oferta e passos explicados",
                    "Dicas de pagamento e segurança",
                    "Layout rápido e responsivo",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-300 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right card */}
              <div className="gradient-border p-5 md:p-6 shadow-neon">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-300">Destaque</div>
                  <div className="inline-flex items-center gap-1 text-xs text-zinc-200">
                    <Star className="h-4 w-4 text-yellow-300" /> 4,7/5 (usuários)
                  </div>
                </div>

                <div className="mt-4 grid gap-4">
                  <InfoRow icon={<Zap className="h-5 w-5 text-cyan-300" />} title="Odds competitivas" text="Mercados amplos e linhas populares de futebol." />
                  <InfoRow icon={<Flame className="h-5 w-5 text-emerald-300" />} title="Ao vivo (Live)" text="Aposte durante a partida com atualizações rápidas." />
                  <InfoRow icon={<ShieldCheck className="h-5 w-5 text-blue-300" />} title="Pagamentos locais" text="PIX, cartões e carteiras — conforme disponibilidade." />
                </div>

                <div className="mt-5">
                  <CTAButton
                    baseUrl={affiliateUrl}
                    variant={variant}
                    placement="hero_card"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-bold bg-white/10 hover:bg-white/15 transition border border-white/10"
                  >
                    Ir para 1xBet <ChevronRight className="h-5 w-5" />
                  </CTAButton>
                  <p className="mt-3 text-xs text-zinc-400">
                    *Este site é afiliado. Podemos receber comissão se você se registrar via links.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section id="vantagens" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold">Vantagens da 1xBet</h2>
          <p className="mt-2 text-zinc-300 max-w-2xl">
            Benefícios mais buscados por apostadores que priorizam futebol e experiência ao vivo.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "Altas odds", d: "Linhas competitivas em ligas e campeonatos.", i: <Zap className="h-6 w-6 text-cyan-300" /> },
              { t: "Live bets", d: "Apostas em tempo real com mercados dinâmicos.", i: <Flame className="h-6 w-6 text-emerald-300" /> },
              { t: "Saques rápidos*", d: "Processamento pode variar por método e verificação.", i: <Wallet className="h-6 w-6 text-green-300" /> },
              { t: "Pagamentos BR", d: "PIX, Mercado Pago e mais (quando disponíveis).", i: <ShieldCheck className="h-6 w-6 text-blue-300" /> },
            ].map((c) => (
              <div key={c.t} className="gradient-border p-5 hover:translate-y-[-2px] transition duration-300">
                <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 grid place-items-center shadow-neon">
                  {c.i}
                </div>
                <h3 className="mt-4 font-bold">{c.t}</h3>
                <p className="mt-2 text-sm text-zinc-300">{c.d}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-zinc-400">
            *Velocidade de saque depende de KYC/validação e do provedor de pagamento.
          </p>
        </section>

        {/* Bonuses */}
        <section id="bonus" className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">Bônus e promoções</h2>
              <p className="mt-2 text-zinc-300 max-w-2xl">
                Ofertas podem mudar. Mantenha este bloco fácil de editar via um array.
              </p>
            </div>
            <CTAButton
              baseUrl={affiliateUrl}
              variant={variant}
              placement="bonus_top"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Ver no site oficial <ChevronRight className="h-4 w-4" />
            </CTAButton>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {bonuses.map((b) => (
              <div key={b.title} className="gradient-border p-6 hover:translate-y-[-2px] transition duration-300">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-extrabold">{b.title}</h3>
                  <span className="text-xs text-zinc-200 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                    Promo
                  </span>
                </div>
                <p className="mt-2 text-zinc-300">{b.desc}</p>

                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  {b.terms.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300/90" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <CTAButton
                    baseUrl={affiliateUrl}
                    variant={variant}
                    placement="bonus_card"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-bold bg-gradient-to-r from-cyan-500/90 to-emerald-500/90 hover:from-cyan-400 hover:to-emerald-400 transition shadow-neon"
                  >
                    Ativar {b.title} <ChevronRight className="h-5 w-5" />
                  </CTAButton>
                  <a
                    href="#faq"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition"
                  >
                    Ver regras (FAQ) <ChevronRight className="h-5 w-5" />
                  </a>
                </div>

                <p className="mt-3 text-xs text-zinc-400">
                  *Leia termos e condições. Jogue com responsabilidade.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How-to */}
        <section id="como" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold">Como se registrar e receber o bônus</h2>
          <p className="mt-2 text-zinc-300 max-w-2xl">
            Passo a passo simples (ideal para converter tráfego mobile).
          </p>

          <div className="mt-8 grid lg:grid-cols-4 sm:grid-cols-2 gap-4">
            {[
              { step: "1", t: "Cadastro", d: "Crie sua conta com e-mail/telefone." },
              { step: "2", t: "Código promocional", d: "Insira o cupom (se houver) no registro/caixa." },
              { step: "3", t: "Depósito", d: "Escolha PIX/cartão/carteira e deposite." },
              { step: "4", t: "Ativar bônus", d: "Selecione a oferta e siga as regras." },
            ].map((s) => (
              <div key={s.step} className="gradient-border p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-cyan-500/90 to-emerald-500/90 grid place-items-center font-extrabold shadow-neon">
                    {s.step}
                  </div>
                  <h3 className="font-bold">{s.t}</h3>
                </div>
                <p className="mt-3 text-sm text-zinc-300">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <CTAButton
              baseUrl={affiliateUrl}
              variant={variant}
              placement="howto"
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-bold bg-white/10 hover:bg-white/15 transition border border-white/10"
            >
              Começar agora <ChevronRight className="h-5 w-5" />
            </CTAButton>
          </div>
        </section>

        {/* Payments */}
        <section id="pagamentos" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold">Métodos de pagamento (Brasil)</h2>
          <p className="mt-2 text-zinc-300 max-w-2xl">
            Pagamentos podem variar por conta e disponibilidade regional. Veja o guia PIX para detalhes.
          </p>

          <div className="mt-4">
            <a className="underline text-cyan-200 hover:text-white" href="/pix">
              Guia PIX: depósito e saque →
            </a>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "PIX", d: "Rápido e popular no Brasil." },
              { t: "Cartões", d: "Crédito/débito (limites variam)." },
              { t: "Carteiras", d: "E-wallets conforme oferta local." },
              { t: "Outros", d: "Transferência e provedores parceiros." },
            ].map((p) => (
              <div key={p.t} className="gradient-border p-5 hover:translate-y-[-2px] transition duration-300">
                <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 grid place-items-center">
                  <Wallet className="h-6 w-6 text-emerald-300" />
                </div>
                <h3 className="mt-4 font-bold">{p.t}</h3>
                <p className="mt-2 text-sm text-zinc-300">{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Football */}
        <section id="noticias" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold">Notícias do futebol, próximos jogos e tabela</h2>
          

          <div className="mt-8">
            <FootballFeed />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold">FAQ — perguntas frequentes</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {faq.map((item) => (
              <details key={item.q} className="gradient-border p-5 group">
                <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
                  <span>{item.q}</span>
                  <span className="text-cyan-300 group-open:rotate-90 transition">›</span>
                </summary>
                <p className="mt-3 text-sm text-zinc-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold">Avaliações de usuários</h2>
          <p className="mt-2 text-zinc-300 max-w-2xl">Prova social em formato de cartões.</p>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              { name: "Lucas", text: "Consegui ativar o bônus rápido e gostei do live em jogos de futebol.", stars: 5 },
              { name: "Mariana", text: "PIX facilitou o depósito. Importante ler as regras do rollover.", stars: 4 },
              { name: "Rafael", text: "Layout do site é claro, fui direto ao registro e às promoções.", stars: 5 },
            ].map((r) => (
              <div key={r.name} className="gradient-border p-6 hover:translate-y-[-2px] transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="font-bold">{r.name}</div>
                  <div className="flex gap-1">
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-300" />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-300">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <SiteFooter />

        {/* Mobile floating CTA */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
          <CTAButton
            baseUrl={affiliateUrl}
            variant={variant}
            placement="floating_mobile"
            className="rounded-2xl px-5 py-4 font-extrabold bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-neon flex items-center justify-center gap-2"
          >
            {variant === "A" ? "Receber Bônus Agora" : "Ativar e Apostar"}
            <ChevronRight className="h-5 w-5" />
          </CTAButton>
        </div>

        <BonusPopup affiliateUrl={affiliateUrl} variant={variant} />
      </main>
    </>
  );
}

function InfoRow({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-sm text-zinc-300">{text}</div>
      </div>
    </div>
  );
}

function BonusPopup({ affiliateUrl, variant }: { affiliateUrl: string; variant: "A" | "B" }) {
  // Lightweight popup with tracking; uses the CTA URL builder on click in CTAButton elsewhere,
  // here we just open base affiliate URL (tracking still via Meta/GA custom events when clicking button inside).
  return (
    <div className="hidden">
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const key = 'bx_popup_closed_v2';
  if (localStorage.getItem(key) === '1') return;

  const openAfterMs = 15000;
  setTimeout(() => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);z-index:9998;display:flex;align-items:center;justify-content:center;padding:16px;';
    const modal = document.createElement('div');
    modal.style.cssText = 'max-width:520px;width:100%;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);box-shadow:0 0 30px rgba(34,211,238,.22);padding:18px;';
    modal.innerHTML = \`
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
          <div style="font-weight:800;font-size:18px;color:#fff;">Bônus especial por tempo limitado</div>
          <div style="margin-top:6px;color:rgba(255,255,255,.78);font-size:13px;">
            Ative agora e confira as condições diretamente na plataforma.
          </div>
        </div>
        <button id="bx_close" aria-label="Fechar" style="border:none;background:rgba(255,255,255,.08);color:#fff;border-radius:12px;width:38px;height:38px;cursor:pointer;">✕</button>
      </div>
      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
        <a id="bx_go" href="${affiliateUrl}" target="_blank" rel="sponsored nofollow noopener"
           style="flex:1;min-width:220px;text-align:center;padding:12px 14px;border-radius:14px;font-weight:800;color:#061018;
           background:linear-gradient(90deg, rgba(34,211,238,.95), rgba(34,197,94,.95));text-decoration:none;">
          ${variant === "A" ? "Receber Bônus Agora →" : "Ativar e Apostar →"}
        </a>
        <button id="bx_later" style="flex:0;min-width:140px;padding:12px 14px;border-radius:14px;font-weight:700;color:#fff;
           background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.12);cursor:pointer;">
          Mais tarde
        </button>
      </div>
      <div style="margin-top:10px;color:rgba(255,255,255,.6);font-size:11px;">
        18+ | Jogue com responsabilidade. Ofertas podem variar.
      </div>
    \`;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => {
      localStorage.setItem(key, '1');
      overlay.remove();
    };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    modal.querySelector('#bx_close').addEventListener('click', close);
    modal.querySelector('#bx_later').addEventListener('click', close);
    modal.querySelector('#bx_go').addEventListener('click', () => {
      try { window.gtag && window.gtag('event','cta_click',{placement:'popup', variant:'${variant}', link_url:'${affiliateUrl}'}); } catch(e) {}
      try { window.fbq && window.fbq('trackCustom','CTA_Click',{placement:'popup', variant:'${variant}', link_url:'${affiliateUrl}'}); } catch(e) {}
    });

    if (!reduce) {
      modal.animate([{ transform:'translateY(10px)', opacity:0 }, { transform:'translateY(0)', opacity:1 }], { duration:220, easing:'ease-out' });
    }
  }, openAfterMs);
})();
          `,
        }}
      />
    </div>
  );
}
