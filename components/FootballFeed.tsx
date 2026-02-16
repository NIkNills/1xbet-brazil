
"use client";

const PLACEHOLDER_IMG = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='40%25' r='70%25'%3E%3Cstop offset='0%25' stop-color='%2300E5FF' stop-opacity='0.55'/%3E%3Cstop offset='45%25' stop-color='%2300FF88' stop-opacity='0.18'/%3E%3Cstop offset='100%25' stop-color='%230B1020'/%3E%3C/radialGradient%3E%3ClinearGradient id='n' x1='0' x2='1'%3E%3Cstop offset='0' stop-color='%2300E5FF'/%3E%3Cstop offset='1' stop-color='%2300FF88'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='600' fill='url(%23g)'/%3E%3Cpath d='M120 420 C 280 260, 480 520, 640 360 S 1000 300, 1120 180' fill='none' stroke='url(%23n)' stroke-width='10' stroke-linecap='round' opacity='0.9'/%3E%3Ccircle cx='980' cy='210' r='18' fill='%2300E5FF' opacity='0.9'/%3E%3Ccircle cx='1020' cy='250' r='10' fill='%2300FF88' opacity='0.9'/%3E%3Ctext x='60' y='110' fill='white' font-family='Arial, sans-serif' font-size='44' font-weight='700'%3ESPORTS%20HUB%3C/text%3E%3Ctext x='60' y='165' fill='%23B8C7FF' font-family='Arial, sans-serif' font-size='24'%3EConte%C3%BAdo%20atualizado%3C/text%3E%3C/svg%3E";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { NewsItem } from "@/components/NewsModal";


type MatchItem = { title: string; date: string; league?: string; url?: string };

type FootballApiResponse = {
  news: NewsItem[];
  nextMatches: MatchItem[];
  lastResults: MatchItem[];
  standings: any[];
  featured?: { title: string; subtitle: string; note: string };
};

function formatDate(d: string) {
  try {
    const dt = new Date(d);
    return dt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return d;
  }
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

function newsSlug(n: NewsItem) {
  const base = slugify(n.title || "noticia");
  const key = (n.url || n.title || "") + "|" + (n.date || "");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return `${base}-${h.toString(16)}`;
}

function proxiedImg(url?: string) {
  if (!url) return PLACEHOLDER_IMG;
  return `/api/img?url=${encodeURIComponent(url)}`;
}

const NewsModal = dynamic(() => import("@/components/NewsModal"), { ssr: false });

export default function FootballFeed() {
  const [data, setData] = useState<FootballApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const t = window.setTimeout(() => controller.abort(), 10000);
    let alive = true;

    (async () => {
      try {
        // Let the browser cache work (the API route is already revalidated server-side)
        const res = await fetch("/api/football", { signal: controller.signal });
        const j = await res.json();
        if (alive) setData(j);
      } catch {
        if (alive) setData(null);
      } finally {
        if (alive) setLoading(false);
        window.clearTimeout(t);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
      window.clearTimeout(t);
    };
  }, []);

  const news = useMemo(() => data?.news || [], [data]);
  const hasNews = !!news.length && news[0]?.title !== "Notícias indisponíveis";
  const hasNext = !!data?.nextMatches?.length;
  const hasLast = !!data?.lastResults?.length;

  const featuredLink =
    (hasNext ? data?.nextMatches?.[0]?.url : data?.lastResults?.[0]?.url) || (hasNews ? news[0]?.url : "/noticias");
  const featuredTitle = data?.featured?.title || "Destaque do esporte";
  const featuredSub = hasNext ? data?.featured?.subtitle || "" : data?.featured?.note || data?.featured?.subtitle || "";

  const active = hasNews ? news[activeIndex] : null;

  const openAt = (idx: number) => {
    setActiveIndex(Math.max(0, Math.min(idx, news.length - 1)));
    setOpen(true);
  };

  const onClose = () => setOpen(false);
  const onPrev = () => {
    if (!news.length) return;
    setActiveIndex((i) => (i - 1 + news.length) % news.length);
  };
  const onNext = () => {
    if (!news.length) return;
    setActiveIndex((i) => (i + 1) % news.length);
  };

  return (
    <section id="noticias" className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Notícias do futebol, próximos jogos e resultados
        </h2>
        <p className="mt-2 text-zinc-300">{loading ? "Carregando..." : "Atualizado automaticamente."}</p>
      </div>

      {/* TOP */}
      <div className="grid gap-4 lg:grid-cols-3">
        <a
          href={featuredLink || "#"}
          target="_blank"
          rel="nofollow noopener"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/10"
        >
          <div className="text-sm font-semibold text-white/80">Destaque do esporte</div>
          <div className="mt-3 text-lg font-extrabold text-white">{featuredTitle}</div>
          {featuredSub ? <div className="mt-2 text-sm text-zinc-300">{featuredSub}</div> : null}
        </a>

        {hasNext ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-white/80">Próximos jogos</div>
            <div className="mt-3 space-y-3">
              {data!.nextMatches.slice(0, 4).map((m, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-white">
                      {m.url ? (
                        <a href={m.url} target="_blank" rel="nofollow noopener" className="underline hover:text-white">
                          {m.title}
                        </a>
                      ) : (
                        m.title
                      )}
                    </div>
                    {m.league ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                        {m.league}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">{formatDate(m.date)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {hasLast ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-white/80">Últimos resultados</div>
            <div className="mt-3 space-y-3">
              {data!.lastResults.slice(0, 4).map((m, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-white">
                      {m.url ? (
                        <a href={m.url} target="_blank" rel="nofollow noopener" className="underline hover:text-white">
                          {m.title}
                        </a>
                      ) : (
                        m.title
                      )}
                    </div>
                    {m.league ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                        {m.league}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">{formatDate(m.date)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* NEWS */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-extrabold text-white">Notícias esportivas (PT-BR)</h3>
          <span className="text-xs text-white/60">Últimas</span>
        </div>

        {!hasNews ? (
          <div className="text-sm text-zinc-300">Sem notícias no momento.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {news.slice(0, 6).map((n, idx) => {
              const href = `/noticias/${newsSlug(n)}?u=${encodeURIComponent(n.url || "")}`;
              return (
                <article key={idx} className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                  <button type="button" onClick={() => openAt(idx)} className="block w-full text-left" aria-label="Abrir notícia">
                    <div className="relative">
                      <img
                        src={proxiedImg(n.image)}
                        alt={n.title}
                        className="h-44 w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>

                    <div className="p-5">
                      <h4 className="text-lg font-extrabold text-white">{n.title}</h4>
                      <div className="mt-1 text-xs text-white/60">
                        {formatDate(n.date)}
                        {n.source ? ` • ${n.source}` : ""}
                      </div>
                      {n.description ? <p className="mt-3 line-clamp-3 text-sm text-zinc-300">{n.description}</p> : null}

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                          Abrir <span aria-hidden>→</span>
                        </span>

                        <a href={href} className="text-xs font-semibold text-white/60 hover:text-white">
                          Página SEO ↗
                        </a>
                      </div>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <NewsModal open={open} item={active} index={activeIndex} total={news.length} onClose={onClose} onPrev={onPrev} onNext={onNext} />
    </section>
  );
}
