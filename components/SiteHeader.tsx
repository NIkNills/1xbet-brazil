import { Flame, ChevronRight } from "lucide-react";
import CTAButton from "./CTAButton";
import type { CtaVariant } from "@/lib/affiliate";

export default function SiteHeader({
  affiliateUrl,
  variant,
}: {
  affiliateUrl: string;
  variant: CtaVariant;
}) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-black/35 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center shadow-neon">
            <Flame className="h-5 w-5 text-cyan-300" />
          </div>
          <span className="font-semibold tracking-tight group-hover:text-cyan-200 transition">
            1xBet Bônus BR
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          <a className="hover:text-white transition" href="/#vantagens">Vantagens</a>
          <a className="hover:text-white transition" href="/#bonus">Bônus</a>
          <a className="hover:text-white transition" href="/#como">Como funciona</a>
          <a className="hover:text-white transition" href="/#pagamentos">Pagamentos</a>
          <a className="hover:text-white transition" href="/#noticias">Notícias</a>
          <a className="hover:text-white transition" href="/#faq">FAQ</a>
          <a className="hover:text-white transition" href="/bonus">Guia de bônus</a>
        </nav>

        <CTAButton
          baseUrl={affiliateUrl}
          variant={variant}
          placement="header"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-gradient-to-r from-cyan-500/90 to-emerald-500/90 hover:from-cyan-400 hover:to-emerald-400 transition shadow-neon"
        >
          Receber Bônus <ChevronRight className="h-4 w-4" />
        </CTAButton>
      </div>
    </header>
  );
}
