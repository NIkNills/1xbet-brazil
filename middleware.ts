import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const existing = req.cookies.get("exp_cta_v1")?.value;
  if (existing === "A" || existing === "B") {
    return NextResponse.next();
  }

  const v = Math.random() < 0.5 ? "A" : "B";
  const res = NextResponse.next();
  res.cookies.set("exp_cta_v1", v, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
