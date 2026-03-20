type GtagCommand = "config" | "event" | "js";

declare global {
  interface Window {
    gtag: (command: GtagCommand, ...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const SITE_NAME = "Life After 6PM";

export function setPageTitle(title?: string) {
  document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
}

export function pageview(path: string) {
  if (!GA_ID || typeof window.gtag !== "function") return;
  // GA4 strips hash fragments from page_location, so we convert
  // the hash route into a virtual path: /#journal/abc → /journal/abc
  const hashPath = path.replace(/^\/#?/, "/").replace(/\/+/g, "/");
  const base = window.location.origin + window.location.pathname.replace(/\/$/, "");
  window.gtag("event", "page_view", {
    page_location: base + hashPath,
    page_title: document.title,
  });
}

export function event(name: string, params?: Record<string, unknown>) {
  if (!GA_ID || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export function trackScrollDepth(
  element: HTMLElement,
  journalId: string
): () => void {
  const thresholds = [25, 50, 75, 100];
  const fired = new Set<number>();

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const rect = element.getBoundingClientRect();
      const scrolled = window.innerHeight - rect.top;
      const total = rect.height;
      if (total <= 0) return;

      const percent = Math.min(100, Math.round((scrolled / total) * 100));

      for (const t of thresholds) {
        if (percent >= t && !fired.has(t)) {
          fired.add(t);
          event("scroll_depth", {
            journal_id: journalId,
            depth: t,
          });
        }
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  return () => window.removeEventListener("scroll", onScroll);
}

export function trackReadTime(journalId: string): () => void {
  const start = Date.now();

  function sendReadTime() {
    const seconds = Math.round((Date.now() - start) / 1000);
    if (seconds > 0) {
      event("read_time", {
        journal_id: journalId,
        seconds,
      });
    }
  }

  window.addEventListener("beforeunload", sendReadTime);

  return () => {
    window.removeEventListener("beforeunload", sendReadTime);
    sendReadTime();
  };
}
