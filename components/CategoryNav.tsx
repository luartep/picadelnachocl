"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";

export function CategoryNav({ categories }: { categories: Category[] }) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    const activeButton = pillsRef.current?.querySelector(
      `[data-cat-id="${activeId}"]`
    );
    activeButton?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId]);

  function handleClick(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const offset = 124;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <div className="sticky top-16 z-40 bg-truck-black/95 backdrop-blur-sm border-b border-truck-yellow/10 py-3">
      <div
        ref={pillsRef}
        className="no-scrollbar flex gap-2 overflow-x-auto px-4 max-w-5xl mx-auto"
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeId;
          return (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-colors ${
                isActive
                  ? "bg-truck-yellow text-truck-black"
                  : "bg-truck-charcoal text-truck-cream-dim border border-white/10"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
