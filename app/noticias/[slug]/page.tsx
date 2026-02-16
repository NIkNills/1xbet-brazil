import { Metadata } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
  searchParams: { u?: string };
};

async function getData() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "https";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/football`, { cache: "no-store" });
  return res.json();
}

function proxiedImg(url?: string) {
  if (!url) return null;
  return `/api/img?url=${encodeURIComponent(url)}`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const data = await getData();
  const u = searchParams.u || "";
  const item = (Array.isArray(data?.news) ? data.news : []).find((n: any) => (n.url || "") === u);
  if (!item) return { title: "Notícia — 1xBet Bônus BR" };

  return {
    title: `${item.title} — 1xBet Bônus BR`,
    description: item.description || "Notícia esportiva.",
    openGraph: {
      title: item.title,
      description: item.description || "",
      images: item.image ? [{ url: proxiedImg(item.image)! }] : [],
      type: "article",
    },
  };
}

export default async function NoticiaPage({ searchParams }: Props) {
  const data = await getData();
  const u = searchParams.u || "";
  const item = (Array.isArray(data?.news) ? data.news : []).find((n: any) => (n.url || "") === u);

  if (!item) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-extrabold text-white">Notícia não encontrada</h1>
        <p className="mt-3 text-zinc-300">Esse conteúdo pode ter sido atualizado. Volte para a lista de notícias.</p>
        <a href="/noticias" className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10">
          Voltar
        </a>
      </main>
    );
  }

  const img = proxiedImg(item.image);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    datePublished: item.date,
    image: item.image ? [item.image] : undefined,
    publisher: { "@type": "Organization", name: item.source || "Fonte" },
    mainEntityOfPage: item.url || "",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="text-4xl font-extrabold text-white">{item.title}</h1>
      <div className="mt-2 text-xs text-white/60">
        {(item.source ? item.source : "Fonte")} • {new Date(item.date).toLocaleString("pt-BR")}
      </div>

      {img ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <img src={img} alt={item.title} className="h-64 w-full object-cover" />
        </div>
      ) : null}

      {item.description ? <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-zinc-200">{item.description}</p> : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a href="/noticias" className="inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-white hover:bg-white/10">
          Voltar para notícias
        </a>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="nofollow noopener"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 px-6 py-2 font-extrabold text-white hover:from-cyan-500/30 hover:to-emerald-500/30"
          >
            Abrir no site original ↗
          </a>
        ) : null}
      </div>
    </main>
  );
}
