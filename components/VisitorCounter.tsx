"use client";
import {useEffect, useState} from "react";

const STORAGE_KEY = "visitor-counted";

// Shows how many visitors have entered the site. A browser is counted once
// (flagged in localStorage); repeat visits only read the current total.
export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alreadyCounted = false;
    try {
      alreadyCounted = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {}

    fetch("/api/visits", {method: alreadyCounted ? "GET" : "POST"})
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.count === "number") {
          setCount(data.count);
          if (!alreadyCounted) {
            try {
              localStorage.setItem(STORAGE_KEY, "1");
            } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);

  if (count === null) return null;

  return (
    <p className="mb-2 text-xs text-brand-ink/60">
      מספר המבקרים באתר: {count.toLocaleString("he-IL")}
    </p>
  );
}
