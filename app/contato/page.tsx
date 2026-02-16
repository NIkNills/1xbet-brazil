import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCtaVariant } from "@/lib/affiliate";

export const metadata: Metadata = {
  title: "Contato – 1xBet Bônus BR",
  description: "Entre em contato sobre correções, parceria ou dúvidas sobre o conteúdo.",
};

export default function Page() {
  const affiliateUrl = process.env.NEXT_PUBLIC_AFFILIATE_URL || "https://your-aff-link.example/";
  const variant = getCtaVariant();

  return (
    <main className="min-h-screen bg-[#070A12] bg-hero-glow">
      <SiteHeader affiliateUrl={affiliateUrl} variant={variant} />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-extrabold">Contato</h1>
        <p className="mt-3 text-zinc-300 max-w-3xl">
          Para sugestões e correções, envie mensagem para o e-mail exibido no seu site (ou implemente um formulário).
        </p>
        <div className="mt-6 gradient-border p-6 text-zinc-300">
          <h2 className="text-xl font-extrabold">Dica</h2>
          <p className="mt-2">
            Se quiser, posso adicionar um formulário com envio via API (Resend/SMTP) e proteção anti-spam.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
