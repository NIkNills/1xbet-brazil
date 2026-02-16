import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-black/20 to-black/60">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="text-lg font-extrabold text-white">1xBet Bônus BR</div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Guia rápido para começar na 1xBet: bônus, PIX, código promocional e notícias do futebol em português (Brasil).
            </p>
            <a
              href={process.env.NEXT_PUBLIC_AFFILIATE_URL || "https://your-aff-link.example/"}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10"
            >
              Acessar 1xBet <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          {/* Links */}
          <div className="text-sm text-zinc-300">
            <div className="font-semibold text-white/90">Conteúdo</div>
            <ul className="mt-3 space-y-2">
              <li>
                <Link className="hover:text-white underline underline-offset-4" href="/bonus">
                  Bônus e regras
                </Link>
              </li>
              <li>
                <Link className="hover:text-white underline underline-offset-4" href="/codigo-promocional">
                  Código promocional
                </Link>
              </li>
              <li>
                <Link className="hover:text-white underline underline-offset-4" href="/pix">
                  PIX e pagamentos
                </Link>
              </li>
              <li>
                <Link className="hover:text-white underline underline-offset-4" href="/noticias">
                  Notícias do esporte
                </Link>
              </li>
              <li>
                <Link className="hover:text-white underline underline-offset-4" href="/privacidade">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Responsible */}
          <div className="text-sm text-zinc-300">
            <div className="font-semibold text-white/90">Jogo responsável</div>
            <p className="mt-3 leading-relaxed">
              18+ Apenas. Aposte com responsabilidade e defina limites.
            </p>
            <p className="mt-2 leading-relaxed">
              Se apostar estiver causando problemas, procure apoio profissional e serviços locais no Brasil.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <div>
            Divulgação de afiliado: podemos receber comissão por indicações, sem custo extra para você.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span>Contato:</span>
            <a href="mailto:niknills94@gmail.com" className="underline hover:text-white">
              niknills94@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
