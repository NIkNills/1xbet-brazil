export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/35">
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-extrabold text-lg">1xBet Bônus BR</div>
          <p className="mt-2 text-sm text-zinc-300">
            Site afiliado/informativo. Conteúdos podem mudar sem aviso.
          </p>
        </div>

        <div className="text-sm text-zinc-300 space-y-2">
          <div className="font-semibold text-zinc-100">Responsável</div>
          <p>18+ Apenas. Jogue com responsabilidade.</p>
          <p>Se precisar de ajuda, procure apoio profissional e serviços locais.</p>
        </div>

        <div className="text-sm text-zinc-300 space-y-2">
          <div className="font-semibold text-zinc-100">Legal & Contato</div>
          <p>
            <strong>Affiliate disclosure:</strong> podemos receber comissão por indicações.
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><a
              href="mailto:niknills94@gmail.com"
              className="hover:text-white underline"
            >
              Contato: niknills94@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
