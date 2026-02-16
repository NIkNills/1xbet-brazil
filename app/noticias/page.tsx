import Link from "next/link";
import { Metadata } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Notícias esportivas — 1xBet Bônus BR",
  description: "Últimas notícias esportivas em português (Brasil).",
};

function getBaseUrl() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function getData() {
  // Use current host in Netlify/SSR (avoids localhost + SSL issues during build)
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/football`, {
    cache: "no-store",
    next: { revalidate: 0, tags: ["football-feed"] },
  });
  if (!res.ok) return { news: [] };
  return res.json();
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function newsSlug(n: any) {
  const base = slugify(n.title || "noticia");
  const key = (n.url || n.title || "") + "|" + (n.date || "");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return `${base}-${h.toString(16)}`;
}

export default async function NoticiasPage() {
  let data: any = { news: [] };
  try {
    data = await getData();
  } catch {
    data = { news: [] };
  }
  const news = Array.isArray(data?.news) ? data.news : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-extrabold text-white">Notícias esportivas</h1>
      <p className="mt-2 text-zinc-300">Últimas notícias e destaques do esporte (Brasil).</p>

      {!news.length ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-200">
          Sem notícias no momento. Tente novamente em instantes.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {news.map((n: any, idx: number) => {
            const slug = newsSlug(n);
            const u = encodeURIComponent(n.url || "");
            return (
              <Link
                key={idx}
                href={`/noticias/${slug}?u=${u}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-lg font-extrabold text-white">{n.title}</div>
                <div className="mt-2 line-clamp-3 text-sm text-zinc-300">{n.description}</div>
                <div className="mt-3 text-xs text-white/60">
                  {(n.source ? n.source : "Fonte")} • {new Date(n.date).toLocaleString("pt-BR")}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
