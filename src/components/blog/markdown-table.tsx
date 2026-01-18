"use client";

import { ReactNode, useRef, useState, useEffect, useCallback } from "react";

interface MarkdownTableProps {
  children: ReactNode;
}

export function MarkdownTable({ children }: MarkdownTableProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  return (
    <div className="relative my-6">
      {/* Left scroll indicator */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Right scroll indicator */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Table wrapper */}
      <div
        ref={wrapperRef}
        className="-mx-4 px-4 overflow-x-auto md:mx-0 md:px-0"
      >
        <table className="w-full min-w-[500px] border-collapse">
          {children}
        </table>
      </div>
    </div>
  );
}
