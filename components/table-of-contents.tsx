"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";
import { cn } from "@/lib/utils";

type TocProps = {
  items: TocItem[];
};

const useActiveToc = (items: TocItem[]) => {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (headings.length === 0) return;

    let frame = 0;
    const offset = 120;
    const updateActive = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollPosition = window.scrollY + offset;
        let currentId = headings[0].id;

        for (const heading of headings) {
          if (heading.offsetTop <= scrollPosition) {
            currentId = heading.id;
          } else {
            break;
          }
        }
        setActiveId(currentId);
      });
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  return activeId;
};

const TocList = ({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[];
  activeId?: string;
  onNavigate?: () => void;
}) => {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <li
            key={item.id}
            className={cn(
              "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-500 hover:font-semibold transition-colors",
              isActive && "text-foreground font-semibold",
              item.level === 3 && "pl-3",
              item.level === 4 && "pl-6",
            )}
          >
            <a
              href={`#${item.id}`}
              onClick={onNavigate}
              aria-current={isActive ? "true" : undefined}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export function TableOfContents({ items }: TocProps) {
  const activeId = useActiveToc(items);
  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <div className="mt-3">
        <TocList items={items} activeId={activeId} />
      </div>
    </div>
  );
}

export function MobileToc({ items }: TocProps) {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const activeId = useActiveToc(items);

  useEffect(() => {
    const handleHashChange = () => setOpen(false);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      return;
    }
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer fixed bottom-8 left-5 z-40 rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.25),0_0_12px_rgba(59,130,246,0.15)] dark:bg-neutral-100 dark:text-black dark:shadow-[0_0_28px_rgba(255,255,255,0.35),0_0_12px_rgba(255,255,255,0.2)]"
        aria-label="목차 열기"
      >
        목차
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="목차 닫기"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl border border-border bg-card shadow-xl transition-all duration-300 ease-out",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0",
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <p className="text-sm font-semibold">목차</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
                aria-label="닫기"
              >
                닫기
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              <TocList
                items={items}
                activeId={activeId}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
