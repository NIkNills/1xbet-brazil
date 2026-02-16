import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCtaVariant } from "@/lib/affiliate";

export const metadata: Metadata = {
  title: "Política de Privacidade – 1xBet Bônus BR",
  description: "Informações sobre privacidade, cookies, analytics e divulgação de afiliado.",
};

export default function Page() {
  const affiliateUrl = process.env.NEXT_PUBLIC_AFFILIATE_URL || "https://your-aff-link.example/";
  const variant = getCtaVariant();

  return (
    <main className="min-h-screen bg-[#070A12] bg-hero-glow">
      <SiteHeader affiliateUrl={affiliateUrl} variant={variant} />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-extrabold">Política de Privacidade</h1>
        <div className="mt-6 space-y-4 text-zinc-300">
          <div className="gradient-border p-6">
            <h2 className="text-xl font-extrabold">Afiliado</h2>
            <p className="mt-2">
              Este site pode receber comissão por indicações realizadas via links. Isso não altera o preço para o usuário.
            </p>
          </div>
          <div className="gradient-border p-6">
            <h2 className="text-xl font-extrabold">Cookies e Analytics</h2>
            <p className="mt-2">
              Podemos usar cookies para testes A/B e analytics (GA4/Meta Pixel) com o objetivo de melhorar a experiência e medir cliques em CTA.
            </p>
          </div>
          <div className="gradient-border p-6">
            <h2 className="text-xl font-extrabold">Dados pessoais</h2>
            <p className="mt-2">
              Não solicitamos dados sensíveis pelo site. Caso entre em contato, use apenas informações necessárias.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
