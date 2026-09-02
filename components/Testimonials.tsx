"use client";

import { useEffect, useState } from "react";

type Testimonial = { _id: string; clientName: string; quote: string };

const ROTATE_MS = 5000;
const FADE_MS = 500;

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  if (count === 0) return null;

  // Derived, not stored: keeps the slide in range if the list shrinks after a
  // revalidate, without a second render pass.
  const active = index % count;

  return (
    <section className="mx-auto max-w-4xl px-6 pb-24 sm:pb-32">
      <h2 className="mb-8 text-center text-sm font-medium uppercase tracking-[0.2em] text-brand-ink sm:mb-12">
        מהלקוחות
      </h2>
      {/* Every slide sits in the same 1x1 grid cell, so the box keeps the
          height of the longest quote and never jumps as it auto-advances.
          Hovering pauses the rotation. */}
      <div
        className="grid"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {testimonials.map((t, i) => (
          <blockquote
            key={t._id}
            aria-hidden={i !== active}
            className="col-start-1 row-start-1 flex flex-col justify-center rounded-md bg-white/50 p-6 text-center shadow-sm transition-opacity ease-in-out motion-reduce:transition-none"
            style={{
              transitionDuration: `${FADE_MS}ms`,
              opacity: i === active ? 1 : 0,
              pointerEvents: i === active ? "auto" : "none",
            }}
          >
            <p className="italic leading-relaxed text-brand/75">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4 text-xs font-normal text-brand-ink">{t.clientName}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
