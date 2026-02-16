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

function stripTags(s: string) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImg(url: string) {
  return url && url.startsWith("http") ? url : undefined;
}

const UA_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; AffiliateSiteBot/1.0)",
  Accept: "application/json,text/plain,*/*",
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
  return /(futebol|jogo|time|sele[cç][aã]o|gol|campeonato|copa|libertadores|champions|brasileir[aã]o|nba|ufc|mma|f1|fórmula|tenis|tênis|vôlei|basquete)/i.test(
    text
  );
}

function requireNewsImage() {
  const v = (process.env.NEWS_REQUIRE_IMAGE || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

// ---------- News: NewsAPI (optional key) ----------
function envNewsKey() {
  return (process.env.NEWSAPI_KEY || process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWSAPI_KEY || "").trim();
}

async function fetchNewsApi(out: Feed) {
  const newsKey = envNewsKey();
  if (!newsKey) {
    out.debug = { ...(out.debug || {}), newsapi: "missing_key" };
    return;
  }

  const res1 = await fetch("https://newsapi.org/v2/top-headlines?country=br&category=sports&pageSize=50", {
    headers: { "X-Api-Key": newsKey, ...UA_HEADERS },
    next: { revalidate: 900, tags: ["sports-news"] },
  });

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
    const res2 = await fetch(`https://newsapi.org/v2/everything?q=${q}&language=pt&sortBy=publishedAt&pageSize=50`, {
      headers: { "X-Api-Key": newsKey, ...UA_HEADERS },
      next: { revalidate: 900, tags: ["sports-news"] },
    });

    if (res2.ok) {
      const j2 = await res2.json();
      const a2 = Array.isArray(j2.articles) ? j2.articles : [];
      const merged = [...a1, ...a2];
      pick = merged.filter((a) => !isClearlyNotSports(a) && isSportsRelevant(a)).slice(0, 10);
    } else {
      out.debug = { ...(out.debug || {}), newsapi_everything: { status: res2.status } };
    }
  }

  const picked = pick
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

  out.news = picked;
  out.debug = { ...(out.debug || {}), newsapi: { ok: picked.length > 0, picked: picked.length } };
}

// ---------- News fallback: Google News RSS (no key) ----------
function xmlGetAll(xml: string, tag: string) {
  const re = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out.push(m[1]);
  return out;
}

function xmlFirst(xml: string, tag: string) {
  const all = xmlGetAll(xml, tag);
  return all.length ? all[0] : "";
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchGoogleRss(out: Feed) {
  // Google News RSS is usually stable + valid TLS.
  const url =
    "https://news.google.com/rss/search?q=futebol%20OR%20brasileir%C3%A3o%20OR%20libertadores%20OR%20champions%20OR%20nba&hl=pt-BR&gl=BR&ceid=BR:pt-419";

  const res = await fetch(url, { headers: UA_HEADERS, next: { revalidate: 900, tags: ["sports-rss"] } });
  if (!res.ok) {
    out.debug = { ...(out.debug || {}), rss_google_status: res.status };
    return;
  }

  const xml = await res.text();
  const itemXml = xmlGetAll(xml, "item");

  const picked: NewsItem[] = itemXml
    .map((ix) => {
      const title = stripTags(decodeEntities(xmlFirst(ix, "title")));
      const link = stripTags(decodeEntities(xmlFirst(ix, "link")));
      const pubDate = stripTags(decodeEntities(xmlFirst(ix, "pubDate"))) || new Date().toISOString();
      const desc = stripTags(decodeEntities(xmlFirst(ix, "description")));
      // Some Google RSS items have source in <source>...</source>
      const src = stripTags(decodeEntities(xmlFirst(ix, "source")));

      return {
        title: title || "Notícia esportiva",
        description: desc || "",
        date: pubDate,
        image: undefined,
        url: link || undefined,
        source: src || "Google News",
      } as NewsItem;
    })
    .filter((n) => (requireNewsImage() ? !!n.image : true))
    .filter((n) => !isClearlyNotSports(n) && isSportsRelevant(n))
    .slice(0, 8);

  if (picked.length) {
    out.news = picked;
  }

  out.debug = { ...(out.debug || {}), rss_google: { ok: picked.length > 0, picked: picked.length } };
}

// ---------- Matches: football-data.org (optional key) ----------
function footballDataKey() {
  return (process.env.FOOTBALL_DATA_KEY || process.env.FOOTBALLDATA_KEY || "").trim();
}

function fmtMatchFD(m: any): MatchItem | null {
  const home = safeText(m?.homeTeam?.name);
  const away = safeText(m?.awayTeam?.name);
  const dt = safeText(m?.utcDate);
  const comp = safeText(m?.competition?.name);
  const status = safeText(m?.status);
  if (!home || !away || !dt) return null;
  const title = `${home} x ${away}`;
  const url = m?.id ? `https://www.football-data.org/` : undefined;
  return { title, date: dt, league: comp || status || undefined, url };
}

async function fetchFootballData(out: Feed) {
  const key = footballDataKey();
  if (!key) {
    out.debug = { ...(out.debug || {}), footballdata: "missing_key" };
    return;
  }

  const season = (process.env.FOOTBALL_SEASON || "").trim();
  const base = "https://api.football-data.org/v4";
  const url = season ? `${base}/matches?dateFrom=${season}-01-01&dateTo=${season}-12-31&limit=20` : `${base}/matches?limit=20`;

  const res = await fetch(url, { headers: { "X-Auth-Token": key, ...UA_HEADERS }, next: { revalidate: 900, tags: ["football-data"] } });
  if (!res.ok) {
    out.debug = { ...(out.debug || {}), footballdata_status: res.status };
    return;
  }
  const j = await res.json();
  const matches = Array.isArray(j?.matches) ? j.matches : [];

  const now = Date.now();
  const parsed = matches.map(fmtMatchFD).filter(Boolean) as MatchItem[];

  const upcoming = parsed
    .map((m: any) => ({ ...m, ts: m.date ? Date.parse(m.date) : 0 }))
    .filter((m: any) => m.ts >= now)
    .sort((a: any, b: any) => a.ts - b.ts)
    .slice(0, 12);

  const recent = parsed
    .map((m: any) => ({ ...m, ts: m.date ? Date.parse(m.date) : 0 }))
    .filter((m: any) => m.ts < now)
    .sort((a: any, b: any) => b.ts - a.ts)
    .slice(0, 12);

  if (!out.nextMatches.length) out.nextMatches = upcoming.map((x: any) => ({ title: x.title, date: x.date, league: x.league, url: x.url }));
  if (!out.lastResults.length) out.lastResults = recent.map((x: any) => ({ title: x.title, date: x.date, league: x.league, url: x.url }));

  out.debug = { ...(out.debug || {}), footballdata: { ok: true, next: out.nextMatches.length, last: out.lastResults.length } };
}

// ---------- Matches: ScoreBat (no key) ----------
async function fetchScoreBat(out: Feed) {
  const res = await fetch("https://www.scorebat.com/video-api/v3/", {
    next: { revalidate: 900, tags: ["scorebat"] },
    headers: UA_HEADERS,
  });
  if (!res.ok) {
    out.debug = { ...(out.debug || {}), scorebat_status: res.status };
    return;
  }
  const j = await res.json();
  const resp = Array.isArray(j?.response) ? j.response : [];

  const now = Date.now();
  const parsed = resp
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

  // News: NewsAPI → Google RSS fallback
  try {
    await fetchNewsApi(out);
  } catch (e: any) {
    out.debug = { ...(out.debug || {}), newsapi_error: String(e?.message || e) };
  }
  if (!out.news.length) {
    try {
      await fetchGoogleRss(out);
    } catch (e: any) {
      out.debug = { ...(out.debug || {}), rss_google_error: String(e?.message || e) };
    }
  }

  // Matches: football-data.org → ScoreBat
  try {
    await fetchFootballData(out);
  } catch (e: any) {
    out.debug = { ...(out.debug || {}), footballdata_error: String(e?.message || e) };
  }
  if (!out.nextMatches.length && !out.lastResults.length) {
    try {
      await fetchScoreBat(out);
    } catch (e: any) {
      out.debug = { ...(out.debug || {}), scorebat_error: String(e?.message || e) };
    }
  }

  const firstNext = out.nextMatches[0];
  const lastAny = out.lastResults[0];
  out.featured = {
    title: firstNext ? `Destaque: ${firstNext.title}` : "Destaque do esporte",
    subtitle: firstNext?.date ? `${firstNext.date}${firstNext.league ? " • " + firstNext.league : ""}` : "Próximos jogos",
    note: lastAny ? `Último resultado: ${lastAny.title}${lastAny.league ? " • " + lastAny.league : ""}` : "",
  };

  if (!out.news.length) {
    out.news = [{ title: "Notícias indisponíveis", description: "", date: new Date().toISOString(), url: "#", source: "Feed" }];
  }

  if (process.env.NODE_ENV !== "development") delete out.debug;

  return NextResponse.json(out);
}
