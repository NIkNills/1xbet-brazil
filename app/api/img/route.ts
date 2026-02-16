import { NextRequest } from "next/server";

export const runtime = "nodejs";

function isAllowedUrl(u: URL) {
  return u.protocol === "https:" || u.protocol === "http:";
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) return new Response("Missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return new Response("Bad url", { status: 400 });
  }

  if (!isAllowedUrl(target)) return new Response("Unsupported protocol", { status: 400 });

  try {
    const res = await fetch(target.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AffiliateSiteBot/1.0)",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      next: { revalidate: 3600, tags: ["img-proxy"] },
    });

    if (!res.ok) return new Response("Upstream error", { status: 502 });

    const ct = res.headers.get("content-type") || "image/jpeg";
    if (!ct.startsWith("image/")) return new Response("Not an image", { status: 415 });

    const bytes = await res.arrayBuffer();

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Proxy error", { status: 502 });
  }
}
