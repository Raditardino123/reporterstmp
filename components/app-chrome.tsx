"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function startProgress() {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      setProgress((current) => Math.max(current, 12));
      if (!progressTimer.current) {
        progressTimer.current = setInterval(() => {
          setProgress((current) =>
            current >= 88 ? current : Math.min(88, current + Math.max(2, (88 - current) * 0.08)),
          );
        }, 180);
      }
    }

    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.origin !== window.location.origin
      ) {
        return;
      }

      const destination = new URL(anchor.href);
      const current = new URL(window.location.href);
      if (
        destination.pathname === current.pathname &&
        destination.search === current.search &&
        destination.hash === current.hash
      ) {
        return;
      }

      startProgress();
    }

    function handlePopState() {
      startProgress();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      if (progressTimer.current) clearInterval(progressTimer.current);
      progressTimer.current = null;
    };
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    setProgress(100);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setProgress(0), 350);
  }, [pathname]);

  useEffect(
    () => () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  return (
    <>
      <div
        role="progressbar"
        aria-label="Memuat halaman"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="navigation-progress"
        data-active={progress > 0}
        style={{ transform: `scaleX(${progress / 100})` }}
      />
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </MotionConfig>
    </>
  );
}
