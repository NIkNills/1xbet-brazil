"use client";

import { useEffect, useState } from "react";

export default function Countdown({ hours = 24 }: { hours?: number }) {
  const [left, setLeft] = useState(hours * 3600);

  useEffect(() => {
    const start = Date.now();
    const total = hours * 3600;

    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remain = Math.max(0, total - elapsed);
      setLeft(remain);
    }, 1000);

    return () => clearInterval(t);
  }, [hours]);

  const hh = String(Math.floor(left / 3600)).padStart(2, "0");
  const mm = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return <span className="text-sm text-emerald-300 font-bold">{hh}:{mm}:{ss}</span>;
}
