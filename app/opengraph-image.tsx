import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070A12",
          backgroundImage:
            "radial-gradient(900px circle at 20% 20%, rgba(34,211,238,.25), transparent 55%), radial-gradient(700px circle at 85% 45%, rgba(34,197,94,.18), transparent 60%), radial-gradient(600px circle at 50% 90%, rgba(59,130,246,.14), transparent 55%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          padding: 64,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1040,
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,.14)",
            background: "rgba(255,255,255,.05)",
            padding: 56,
            boxShadow: "0 0 40px rgba(34,211,238,.15)",
          }}
        >
          <div style={{ fontSize: 22, opacity: 0.9 }}>Guia afiliado • pt-BR</div>
          <div style={{ marginTop: 16, fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>
            Bônus 100% até R$6000
          </div>
          <div style={{ marginTop: 12, fontSize: 40, fontWeight: 700, color: "rgba(34,197,94,.95)" }}>
            1xBet Brasil
          </div>
          <div style={{ marginTop: 20, fontSize: 22, opacity: 0.85 }}>
            Bônus, código promocional, PIX e passo a passo
          </div>
          <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
            <div style={{ padding: "10px 14px", borderRadius: 999, background: "rgba(34,211,238,.14)", border: "1px solid rgba(34,211,238,.25)" }}>
              Futebol • Live • Odds
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 999, background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.22)" }}>
              PIX • Pagamentos locais
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
