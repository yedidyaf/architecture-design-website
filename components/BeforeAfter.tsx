"use client";
import {useRef, useState} from "react";
import Image from "next/image";

type Props = {beforeSrc: string; afterSrc: string; beforeAlt?: string; afterAlt?: string};

export default function BeforeAfter({beforeSrc, afterSrc, beforeAlt = "לפני", afterAlt = "אחרי"}: Props) {
  const [revealed, setRevealed] = useState(false);
  const start = useRef<{x: number; y: number} | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {if (timer.current) {clearTimeout(timer.current); timer.current = null;}};

  const onDown = (e: React.PointerEvent) => {
    start.current = {x: e.clientX, y: e.clientY};
    clear();
    timer.current = setTimeout(() => setRevealed(true), 120);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    if (Math.abs(e.clientX - start.current.x) > 10 || Math.abs(e.clientY - start.current.y) > 10) {
      clear(); setRevealed(false); start.current = null;
    }
  };
  const end = () => {clear(); setRevealed(false); start.current = null;};

  return (
    <div
      className="group relative aspect-square w-full select-none overflow-hidden rounded-2xl bg-neutral-100"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image src={afterSrc} alt={afterAlt} fill draggable={false} className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
      <Image
        src={beforeSrc}
        alt={beforeAlt}
        fill
        draggable={false}
        className={`object-cover transition-opacity duration-300 ${revealed ? "opacity-100" : "opacity-0"}`}
        sizes="(max-width:768px) 100vw, 33vw"
      />
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        {revealed ? beforeAlt : afterAlt}
      </span>
      <span className={`pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white transition-opacity duration-300 ${revealed ? "opacity-0" : "opacity-100"}`}>
        החזק כדי לראות לפני
      </span>
    </div>
  );
}