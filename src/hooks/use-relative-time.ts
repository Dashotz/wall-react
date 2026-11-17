"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/format-time";

export function useRelativeTime(isoDateString: string): string {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 15_000);

    return () => clearInterval(interval);
  }, []);

  return formatRelativeTime(isoDateString, nowMs);
}

