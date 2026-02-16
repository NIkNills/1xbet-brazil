import type { Metadata } from "next";
import "../styles/globals.css";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  title: "1xBet Brasil – Bônus, Código Promocional e Como Apostar",
  description:
    "Guia completo da 1xBet Brasil: bônus de boas-vindas, cashback, freebet, códigos promocionais e passo a passo para receber ofertas com segurança.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "1xBet Brasil – Bônus, Código Promocional e Como Apostar",
    description:
      "Bônus 100% até R$6000, ofertas exclusivas e guia de registro com PIX e pagamentos locais.",
    type: "website",
    locale: "pt_BR",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "1xBet Brasil – Bônus, Código Promocional e Como Apostar",
    description:
      "Bônus 100% até R$6000, ofertas exclusivas e guia de registro com PIX e pagamentos locais.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="text-zinc-100 antialiased">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
