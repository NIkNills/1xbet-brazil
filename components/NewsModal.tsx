"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='40%25' r='70%25'%3E%3Cstop offset='0%25' stop-color='%2300E5FF' stop-opacity='0.55'/%3E%3Cstop offset='45%25' stop-color='%2300FF88' stop-opacity='0.18'/%3E%3Cstop offset='100%25' stop-color='%230B1020'/%3E%3C/radialGradient%3E%3ClinearGradient id='n' x1='0' x2='1'%3E%3Cstop offset='0' stop-color='%2300E5FF'/%3E%3Cstop offset='1' stop-color='%2300FF88'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='600' fill='url(%23g)'/%3E%3Cpath d='M120 420 C 280 260, 480 520, 640 360 S 1000 300, 1120 180' fill='none' stroke='url(%23n)' stroke-width='10' stroke-linecap='round' opacity='0.9'/%3E%3Ccircle cx='980' cy='210' r='18' fill='%2300E5FF' opacity='0.9'/%3E%3Ccircle cx='1020' cy='250' r='10' fill='%2300FF88' opacity='0.9'/%3E%3Ctext x='60' y='110' fill='white' font-family='Arial, sans-serif' font-size='44' font-weight='700'%3ESPORTS%20HUB%3C/text%3E%3Ctext x='60' y='165' fill='%23B8C7FF' font-family='Arial, sans-serif' font-size='24'%3EConte%C3%BAdo%20atualizado%3C/text%3E%3C/svg%3E";

export type NewsItem = {
  title: string;
  description: string;
  date: string;
  image?: string;
  url?: string;
  source?: string;
};

function formatDate(d: string) {
  try {
    const dt = new Date(d);
    return dt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return d;
  }
}

function proxiedImg(url?: string) {
  if (!url) return PLACEHOLDER_IMG;
  return `/api/img?url=${encodeURIComponent(url)}`;
}

function getFocusable(container: HTMLElement) {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  );
  // Only visible/active
  return nodes.filter((el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
}

export default function NewsModal({
  open,
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  open: boolean;
  item: NewsItem | null;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const touchY = useRef<number | null>(null);

  const title = item?.title || "Notícia";
  const desc = item?.description || "";
  const date = item?.date || new Date().toISOString();
  const source = item?.source || "";
  const img = proxiedImg(item?.image);
  const original = item?.url;

  const [full, setFull] = useState<string>("");
  const [fullLoading, setFullLoading] = useState(false);

  const paragraphs = useMemo(() => {
    const raw = (full || "").trim();
    if (!raw) return [] as string[];
    // Prefer paragraph breaks, but fall back to single line breaks if needed (common in jina output)
    const byDouble = raw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
    if (byDouble.length >= 2) return byDouble;
    return raw.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  }, [full]);

  // Lock background scroll while modal is open (and prevent layout jump)
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollBarW = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollBarW > 0) body.style.paddingRight = `${scrollBarW}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  // Fetch expanded article text on demand (server-side extraction)
  useEffect(() => {
    if (!open) return;
    const url = original || "";
    setFull("");
    if (!url) return;

    let alive = true;
    (async () => {
      try {
        setFullLoading(true);
        const res = await fetch(`/api/article?url=${encodeURIComponent(url)}`, { cache: "force-cache" });
        const j = await res.json();
        if (!alive) return;
        const content = typeof j?.content === "string" ? j.content.trim() : "";
        if (content) setFull(content);
      } catch {
        // ignore, fallback to description
      } finally {
        if (alive) setFullLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, original]);

  // Focus trap + restore focus
  useEffect(() => {
    if (!open) return;

    lastActiveRef.current = document.activeElement as HTMLElement | null;

    // Focus first focusable (or dialog itself)
    const t = window.setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = getFocusable(dialog);
      (focusable[0] || dialog).focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();

      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = getFocusable(dialog);
        if (!focusable.length) {
          e.preventDefault();
          dialog.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!active || active === first || !dialog.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!active || active === last || !dialog.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      // Restore focus to element that opened modal
      const el = lastActiveRef.current;
      if (el && typeof el.focus === "function") el.focus();
    };
  }, [open, onClose, onPrev, onNext]);

  const hint = useMemo(
    () => "Dica: deslize para baixo no mobile para fechar. Esc para fechar. ←/→ para navegar.",
    []
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
          onTouchStart={(e) => {
            touchY.current = e.touches[0]?.clientY ?? null;
          }}
          onTouchMove={(e) => {
            if (touchY.current === null) return;
            const dy = (e.touches[0]?.clientY ?? 0) - touchY.current;
            if (dy > 90) {
              touchY.current = null;
              onClose();
            }
          }}
          onTouchEnd={() => (touchY.current = null)}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 bg-[#070B14] shadow-2xl focus:outline-none"
            initial={{ scale: 0.96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="relative">
              <img
                src={img}
                alt={title}
                className="h-56 w-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              <button
                type="button"
                aria-label="Fechar"
                className="absolute right-3 top-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white hover:bg-black/60"
                onClick={onClose}
              >
                ✕
              </button>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <div className="text-xs text-white/80">
                  {formatDate(date)}
                  {source ? ` • ${source}` : ""}
                </div>
                <div className="text-xs text-white/70">{total > 0 ? `${index + 1}/${total}` : ""}</div>
              </div>
            </div>

            <div className="p-6 max-h-[calc(85vh-14rem)] overflow-y-auto overscroll-contain">
              <h3 className="text-2xl font-extrabold text-white">{title}</h3>

              {fullLoading && !full ? (
                <p className="mt-3 text-sm text-white/70">Carregando a notícia completa…</p>
              ) : null}

              {full ? (
                <div className="mt-3 space-y-4 text-sm leading-relaxed text-zinc-200">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))}
                </div>
              ) : desc ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-300">{desc}</p>
              ) : !fullLoading ? (
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Não foi possível extrair o texto completo desta fonte. Use o botão abaixo para abrir no site original.
                </p>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onPrev}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Próxima →
                  </button>
                </div>

                {original ? (
                  <a
                    href={original}
                    target="_blank"
                    rel="nofollow noopener"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 px-5 py-2 text-sm font-extrabold text-white transition hover:from-cyan-500/30 hover:to-emerald-500/30"
                  >
                    Abrir no site original ↗
                  </a>
                ) : null}
              </div>

              <div className="mt-4 text-xs text-white/50">{hint}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
