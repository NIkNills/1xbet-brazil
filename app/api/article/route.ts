import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600;

// Notes on extraction:
// Many Brazilian sports publishers render content dynamically or behind paywalls.
// A naive "strip tags" approach often returns navigation chrome or a truncated snippet.
// We therefore:
// 1) try direct HTML extraction
// 2) if the extracted text is too short / low quality, fallback to r.jina.ai which provides
//    a readability-like text view for many sites.

function decodeEntities(input: string) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(html: string) {
  // keep paragraph boundaries
  const withBreaks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/p\s*>/gi, "\n\n")
    .replace(/<\s*p\b[^>]*>/gi, "")
    .replace(/<\s*li\b[^>]*>/gi, "• ")
    .replace(/<\s*\/li\s*>/gi, "\n");
  return decodeEntities(withBreaks.replace(/<[^>]+>/g, " "));
}

function cleanText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function limit(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).replace(/\s+\S*$/, "").trim() + "…";
}

async function fetchText(url: string, timeoutMs: number, headers?: Record<string, string>) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers,
      redirect: "follow",
      signal: controller.signal,
      cache: "force-cache",
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

function looksLowQuality(text: string) {
  const t = cleanText(text);
  if (t.length < 900) return true;
  // Too many short lines (menus / lists) and not enough sentence punctuation
  const lines = t.split("\n").filter((l) => l.trim().length > 0);
  const shortLines = lines.filter((l) => l.trim().length < 45).length;
  const punct = (t.match(/[\.!?…]/g) || []).length;
  if (lines.length > 0 && shortLines / lines.length > 0.7 && punct < 12) return true;
  return false;
}

function cleanJina(text: string) {
  // r.jina.ai may include some header/metadata and site chrome.
  let t = text.replace(/\r/g, "");

  // Drop very common metadata lines
  t = t
    .replace(/^\s*URL\s*:\s*.*$/gim, "")
    .replace(/^\s*Source\s*:\s*.*$/gim, "")
    .replace(/^\s*Title\s*:\s*.*$/gim, "")
    .replace(/^\s*Published\s*:\s*.*$/gim, "")
    .replace(/^\s*Author\s*:\s*.*$/gim, "");

  // Remove obvious cookie/consent / subscription boilerplate (pt-BR + en)
  const boiler = [
    /Aceitar\s+cookies/gi,
    /Pol[ií]tica\s+de\s+cookies/gi,
    /Pol[ií]tica\s+de\s+privacidade/gi,
    /Termos\s+de\s+uso/gi,
    /Assine\s+J[aá]/gi,
    /Subscribe/gi,
    /Cookie\s+Policy/gi,
    /Privacy\s+Policy/gi,
    /Sign\s+in/gi,
  ];
  for (const r of boiler) t = t.replace(r, "");

  // Collapse excessive blank lines and spaces
  t = t
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return t;
}

function extractTitle(html: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return "";
  return cleanText(stripTags(m[1]));
}

function removeNoise(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ");
}

function extractTagBlock(html: string, tag: string, startIndex: number) {
  const openRe = new RegExp(`<${tag}\\b`, "ig");
  const closeRe = new RegExp(`</${tag}>`, "ig");

  openRe.lastIndex = startIndex;
  const openM = openRe.exec(html);
  if (!openM) return "";

  let idx = openM.index;
  let depth = 0;

  // Walk through open/close tags and keep a simple nesting counter
  openRe.lastIndex = idx;
  closeRe.lastIndex = idx;

  while (true) {
    const nextOpen = openRe.exec(html);
    const nextClose = closeRe.exec(html);

    if (!nextClose) return ""; // malformed
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      continue;
    } else {
      // closing tag
      if (depth === 0) {
        const end = nextClose.index + nextClose[0].length;
        return html.slice(idx, end);
      }
      depth--;
      continue;
    }
  }
}

function scoreBlock(blockHtml: string) {
  // more text, fewer links = better
  const text = cleanText(stripTags(blockHtml));
  const linkCount = (blockHtml.match(/<a\b/gi) || []).length;
  const textLen = text.length;
  const density = textLen / Math.max(1, linkCount + 1);
  return { text, score: density, textLen, linkCount };
}

function findBestContent(html: string) {
  const cleaned = removeNoise(html);

  // 1) Prefer semantic tags
  const semanticTags = ["article", "main"];
  const candidates: string[] = [];

  for (const t of semanticTags) {
    const m = cleaned.toLowerCase().match(new RegExp(`<${t}\\b`, "i"));
    if (m && typeof m.index === "number") {
      const block = extractTagBlock(cleaned, t, m.index);
      if (block) candidates.push(block);
    }
  }

  // 2) Look for likely wrappers by class/id keywords
  const kw = /(article|post|entry|content|materia|noticia|news|texto|body|story|single)/i;
  const divLike = /<(div|section)\b[^>]*(class|id)=["'][^"']{0,160}["'][^>]*>/gi;

  let match: RegExpExecArray | null;
  let tries = 0;
  while ((match = divLike.exec(cleaned)) && tries < 30) {
    tries++;
    const tag = match[1].toLowerCase();
    const attrs = match[0];
    if (!kw.test(attrs)) continue;

    const start = match.index;
    const block = extractTagBlock(cleaned, tag, start);
    if (block) candidates.push(block);
  }

  // 3) Fallback to body
  if (!candidates.length) {
    const bodyM = cleaned.toLowerCase().match(/<body\b/i);
    if (bodyM && typeof bodyM.index === "number") {
      const body = extractTagBlock(cleaned, "body", bodyM.index);
      if (body) candidates.push(body);
    } else {
      candidates.push(cleaned);
    }
  }

  // Remove common chrome if present
  const pruned = candidates.map((c) =>
    c
      .replace(/<header\b[\s\S]*?<\/header>/gi, " ")
      .replace(/<nav\b[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer\b[\s\S]*?<\/footer>/gi, " ")
      .replace(/<aside\b[\s\S]*?<\/aside>/gi, " ")
  );

  // Pick best by score
  let best = { text: "", score: -1 };
  for (const c of pruned) {
    const s = scoreBlock(c);
    // ignore tiny extracts
    if (s.textLen < 280) continue;
    if (s.score > best.score) best = { text: s.text, score: s.score };
  }

  // If nothing passed threshold, take the longest cleaned text among candidates
  if (!best.text) {
    let longest = "";
    for (const c of pruned) {
      const t = cleanText(stripTags(c));
      if (t.length > longest.length) longest = t;
    }
    best.text = longest;
  }

  return cleanText(best.text);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = (searchParams.get("url") || "").trim();

  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) {
      return NextResponse.json({ error: "invalid_url" }, { status: 400 });
    }

    // Basic SSRF guard: reject localhost/private networks
    if (/^(localhost|127\.|0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(u.hostname)) {
      return NextResponse.json({ error: "blocked_host" }, { status: 400 });
    }

    const res = await fetchText(u.toString(), 9000, {
      "User-Agent": "Mozilla/5.0 (compatible; 1xBetBonusBRBot/1.1)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.7",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "fetch_failed", status: res.status }, { status: 200 });
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html")) {
      return NextResponse.json({ error: "not_html" }, { status: 200 });
    }

    const html = await res.text();
    const title = extractTitle(html);
    let text = findBestContent(html);

    // Fallback: use r.jina.ai (often yields a much more complete article text)
    if (!text || looksLowQuality(text)) {
      const jinaUrl = `https://r.jina.ai/${u.toString()}`;
      const jinaRes = await fetchText(jinaUrl, 11000, {
        "User-Agent": "Mozilla/5.0 (compatible; 1xBetBonusBRBot/1.1)",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.7",
      });
      if (jinaRes.ok) {
        const jinaText = await jinaRes.text();
        const cleaned = cleanJina(jinaText);
        if (cleaned && cleaned.length > (text?.length || 0)) text = cleaned;
      }
    }

    // Keep payload bounded (but large enough for full articles)
    const content = limit(cleanText(text), 80000);

    return NextResponse.json({ title, content, url: u.toString() }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }
}
