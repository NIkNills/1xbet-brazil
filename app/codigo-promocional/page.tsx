import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { ChevronRight } from "lucide-react";
import { getCtaVariant } from "@/lib/affiliate";

export const metadata: Metadata = {
  title: "Código Promocional 1xBet Brasil – Onde Inserir e Como Funciona",
  description: "Aprenda onde inserir o código promocional (registro/depósito), como validar a oferta e o que fazer se o cupom não funcionar.",
};

export default function Page() {
  const affiliateUrl = process.env.NEXT_PUBLIC_AFFILIATE_URL || "https://your-aff-link.example/";
  const variant = getCtaVariant();

  return (
    <main className="min-h-screen bg-[#070A12] bg-hero-glow">
      <SiteHeader affiliateUrl={affiliateUrl} variant={variant} />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-extrabold">Código promocional na 1xBet: onde inserir</h1>
        <p className="mt-3 text-zinc-300 max-w-3xl">Aprenda onde inserir o código promocional (registro/depósito), como validar a oferta e o que fazer se o cupom não funcionar.</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <CTAButton
            baseUrl={affiliateUrl}
            variant={variant}
            placement="seo_page_top"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 transition shadow-neon"
          >
            Receber Bônus Agora <ChevronRight className="h-5 w-5" />
          </CTAButton>
          <a
            href="/#faq"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            Ver FAQ <ChevronRight className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-4">
        <div className="gradient-border p-6">
          <h2 className="text-xl font-extrabold">Onde inserir o código</h2>
          <p className="mt-2 text-zinc-300">Normalmente no cadastro ou no caixa de depósito. Algumas campanhas exigem ativação manual.</p>
        </div>
        <div className="gradient-border p-6">
          <h2 className="text-xl font-extrabold">Erros comuns</h2>
          <p className="mt-2 text-zinc-300">Código expirado, elegibilidade restrita, país/conta não compatível ou requisitos não atendidos.</p>
        </div>
        <div className="gradient-border p-6">
          <h2 className="text-xl font-extrabold">Como confirmar a ativação</h2>
          <p className="mt-2 text-zinc-300">Verifique a área de bônus/promos e leia os termos exibidos para a oferta ativa.</p>
        </div>
        <div className="gradient-border p-6">
          <h2 className="text-xl font-extrabold">Boas práticas</h2>
          <p className="mt-2 text-zinc-300">Tire print dos termos, anote prazos e requisitos e acompanhe o progresso do rollover.</p>
        </div>
        </div>

        <div className="mt-10 gradient-border p-6">
          <h2 className="text-xl font-extrabold">Links úteis</h2>
          <p className="mt-2 text-zinc-300">
            Confira também: <a className="underline hover:text-white" href="/pix">PIX</a> • 
            <a className="underline hover:text-white" href="/codigo-promocional">Código promocional</a> • 
            <a className="underline hover:text-white" href="/bonus">Guia de bônus</a>
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
