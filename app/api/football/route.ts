import { NextResponse } from "next/server";

export const revalidate = 600;

type NewsItem = { title: string; description: string; date: string; image?: string; url?: string; source?: string };
type MatchItem = { title: string; date: string; league?: string; url?: string };
type StandingItem = { league: string; name: string; played?: number; points?: number; position?: number };

type Feed = {
  news: NewsItem[];
  nextMatches: MatchItem[];
  lastResults: MatchItem[];
  standings: StandingItem[];
  featured?: { title: string; subtitle: string; note: string };
  debug?: Record<string, any>;
};

function safeText(v: unknown) {
  return typeof v === "string" ? v : "";
}

function normalizeImg(url: string) {
  return url && url.startsWith("http") ? url : undefined;
}

const UA_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; AffiliateSiteBot/1.0)",
  "Accept": "application/json,text/plain,*/*",
};

function isClearlyNotSports(a: any) {
  const title = safeText(a?.title).toLowerCase();
  const desc = safeText(a?.description).toLowerCase();
  const text = `${title} ${desc}`;
  return /(hotel|turismo|viagem|restaurante|im[óo]veis|novela|celebridade|android|iphone|criptomo|bolsa de valores|internet|tecnologia)/i.test(text);
}

function isSportsRelevant(a: any) {
  const title = safeText(a?.title).toLowerCase();
  const desc = safeText(a?.description).toLowerCase();
  const text = `${title} ${desc}`;

  // Must contain at least one sports keyword (PT/EN/ES common)
  const sportsKw = [
    "futebol","gol","gols","campeonato","liga","libertadores","brasileirão","copa","seleção","jogo","partida","clube",
    "premier","laliga","la liga","serie a","bundesliga","ligue 1","champions",
    "nba","basquete","tênis","tenis","fórmula","formula 1","ufc","mma","vôlei","volei","boxing","boxe",
    "elenco","treinador","técnico","tatico","tático","transfer","contratação","mercado da bola","aposta","odds"
  ];
  const hit = sportsKw.some((k) => text.includes(k));

  // Drop some recurring non-sports noise even if it contains "futebol" somewhere
  const noise = /(launcher|linux|android|iphone|criptomo|bolsa de valores|startup|tecnologia|internet|ia|inteligência artificial)/i.test(text);
  return hit && !noise;
}

function requireNewsImage() {
  return (process.env.NEWS_REQUIRE_IMAGE || "true").toLowerCase() !== "false";
}

function envNewsKey() {
  return (
    process.env.NEWSAPI_KEY ||
    process.env.NEWS_API_KEY ||
    process.env.NEXT_PUBLIC_NEWSAPI_KEY ||
    ""
  ).trim();
}

async function fetchNewsApi(out: Feed) {
  const newsKey = envNewsKey();
  if (!newsKey) {
    out.debug = { ...(out.debug || {}), newsapi: "missing_key" };
    return;
  }

  const res1 = await fetch(
    "https://newsapi.org/v2/top-headlines?country=br&category=sports&pageSize=50",
    { headers: { "X-Api-Key": newsKey, ...UA_HEADERS }, next: { revalidate: 900, tags: ["sports-news"] } }
  );

  let a1: any[] = [];
  if (res1.ok) {
    const j1 = await res1.json();
    a1 = Array.isArray(j1.articles) ? j1.articles : [];
  } else {
    out.debug = { ...(out.debug || {}), newsapi_top: { status: res1.status } };
  }

  let pick = a1.filter((a) => !isClearlyNotSports(a) && isSportsRelevant(a)).slice(0, 10);

  if (pick.length < 6) {
    const q = encodeURIComponent("futebol OR basquete OR tênis OR fórmula 1 OR ufc OR vôlei OR champions OR libertadores OR nba");
    const res2 = await fetch(
      `https://newsapi.org/v2/everything?q=${q}&language=pt&sortBy=publishedAt&pageSize=50`,
      { headers: { "X-Api-Key": newsKey, ...UA_HEADERS }, next: { revalidate: 900, tags: ["sports-news"] } }
    );
    if (res2.ok) {
      const j2 = await res2.json();
      const a2 = Array.isArray(j2.articles) ? j2.articles : [];
      const merged = [...a1, ...a2];
      pick = merged.filter((a) => !isClearlyNotSports(a) && isSportsRelevant(a)).slice(0, 10);
    } else {
      out.debug = { ...(out.debug || {}), newsapi_everything: { status: res2.status } };
    }
  }

  out.news = pick
    .map((a: any) => ({
      title: safeText(a.title) || "Notícia esportiva",
      description: safeText(a.description) || safeText(a.content) || "",
      date: safeText(a.publishedAt) || new Date().toISOString(),
      image: normalizeImg(safeText(a.urlToImage)),
      url: safeText(a.url),
      source: safeText(a?.source?.name),
    }))
    .filter((n) => (requireNewsImage() ? !!n.image : true))
    .slice(0, 8);
  const picked = itemsFromRss
    .filter((n) => (requireNewsImage() ? !!n.image : true))
    .slice(0, 8);

  out.news = picked;
  out.debug = { ...(out.debug || {}), rss: { ok: picked.length > 0, picked: picked.length } };
}

// ---------- Matches: football-data.org (optional key) ----------
function footballDataKey() {
  return (process.env.FOOTBALL_DATA_KEY || process.env.FOOTBALLDATA_KEY || "").trim();
}

function fmtMatchFD(m: any): MatchItem | null {
  const home = safeText(m?.homeTeam?.name);
  const away = safeText(m?.awayTeam?.name);
  const dt = safeText(m?.utcDate);
  const league = safeText(m?.competition?.name) || safeText(m?.competition?.code);
  if (!home || !away || !dt) return null;

  const hs = m?.score?.fullTime?.home ?? m?.score?.halfTime?.home ?? null;
  const as = m?.score?.fullTime?.away ?? m?.score?.halfTime?.away ?? null;
  const hasScore = (hs !== null && hs !== undefined) && (as !== null && as !== undefined);
  const status = safeText(m?.status); // SCHEDULED, TIMED, IN_PLAY, FINISHED

  const showScore = hasScore && (status === "FINISHED" || status === "IN_PLAY" || status === "PAUSED");
  const score = showScore ? ` — ${hs}:${as}` : "";

  return { title: `${home} vs ${away}${score}`, date: dt, league };
}

async function fetchFootballData(out: Feed) {
  const key = footballDataKey();
  if (!key) {
    out.debug = { ...(out.debug || {}), footballdata: "missing_key" };
    return;
  }

  const headers = { "X-Auth-Token": key, ...UA_HEADERS };

  const now = new Date();
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  const dateFrom = toISO(new Date(now.getTime() - 24 * 3600 * 1000));
  const dateTo = toISO(new Date(now.getTime() + 7 * 24 * 3600 * 1000));

  // Single call returns matches for the competitions INCLUDED in the user's subscription/tier.
  // This avoids hardcoding competition codes that may not be available on the free tier.
  const url = `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const res = await fetch(url, { headers, next: { revalidate: 900, tags: ["football-data"] } });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    out.debug = { ...(out.debug || {}), footballdata: { ok: false, status: res.status, body: body.slice(0, 160) } };
    return;
  }

  const j = await res.json();
  const matches = Array.isArray(j?.matches) ? j.matches : [];

  const next: MatchItem[] = [];
  const last: MatchItem[] = [];

  for (const m of matches) {
    const item = fmtMatchFD(m);
    if (!item) continue;
    const status = safeText(m?.status);
    if (status === "FINISHED") last.push(item);
    else next.push(item);
  }

  next.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  last.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  if (next.length) out.nextMatches = next.slice(0, 12);
  if (last.length) out.lastResults = last.slice(0, 12);

  out.debug = { ...(out.debug || {}), footballdata: { ok: true, total: matches.length, next: out.nextMatches.length, last: out.lastResults.length } };
}

// ---------- Matches: ScoreBat fallback (no key) ----------
async function fetchScoreBat(out: Feed) {
  const res = await fetch("https://www.scorebat.com/video-api/v3/", {
    next: { revalidate: 900, tags: ["scorebat"] },
    headers: UA_HEADERS,
  });
  if (!res.ok) {
    out.debug = { ...(out.debug || {}), scorebat: { ok: false, status: res.status } };
    return;
  }
  const j = await res.json();
  const resp = j?.response;
  const list = Array.isArray(resp) ? resp : [];

  const now = Date.now();
  const parsed = list
    .map((m: any) => {
      const title = safeText(m?.title);
      const competition = safeText(m?.competition);
      const date = safeText(m?.date);
      const ts = date ? Date.parse(date) : 0;
      const url = safeText(m?.matchviewUrl || m?.url);
      return { title, league: competition, date, ts, url };
    })
    .filter((x: any) => x.title && x.date && x.ts);

  const upcoming = parsed.filter((x: any) => x.ts >= now).sort((a: any, b: any) => a.ts - b.ts).slice(0, 12);
  const recent = parsed.filter((x: any) => x.ts < now).sort((a: any, b: any) => b.ts - a.ts).slice(0, 12);

  if (!out.nextMatches.length) out.nextMatches = upcoming.map((x: any) => ({ title: x.title, date: x.date, league: x.league, url: x.url }));
  if (!out.lastResults.length) out.lastResults = recent.map((x: any) => ({ title: x.title, date: x.date, league: x.league, url: x.url }));

  out.debug = { ...(out.debug || {}), scorebat: { ok: true, total: parsed.length, next: out.nextMatches.length, last: out.lastResults.length } };
}

export async function GET() {
  const out: Feed = { news: [], nextMatches: [], lastResults: [], standings: [] };

  // News: NewsAPI → RSS
  try { await fetchNewsApi(out); } catch (e: any) { out.debug = { ...(out.debug || {}), newsapi_error: String(e?.message || e) }; }
  if (!out.news.length) {
    try { await fetchRss(out); } catch (e: any) { out.debug = { ...(out.debug || {}), rss_error: String(e?.message || e) }; }
  }

  // Matches: football-data.org → ScoreBat
  try { await fetchFootballData(out); } catch (e: any) { out.debug = { ...(out.debug || {}), footballdata_error: String(e?.message || e) }; }
  if (!out.nextMatches.length && !out.lastResults.length) {
    try { await fetchScoreBat(out); } catch (e: any) { out.debug = { ...(out.debug || {}), scorebat_error: String(e?.message || e) }; }
  }

  const firstNext = out.nextMatches[0];
  const lastAny = out.lastResults[0];
  out.featured = {
    title: firstNext ? `Destaque: ${firstNext.title}` : "Destaque do esporte",
    subtitle: firstNext?.date ? `${firstNext.date}${firstNext.league ? " • " + firstNext.league : ""}` : "Próximos jogos",
    note: lastAny ? `Último resultado: ${lastAny.title}${lastAny.league ? " • " + lastAny.league : ""}` : "",
  };

  if (!out.news.length) out.news = [{ title: "Notícias indisponíveis", description: "", date: new Date().toISOString(), url: "#", source: "Feed" }];

  if (process.env.NODE_ENV !== "development") delete out.debug;

  return NextResponse.json(out);
}
