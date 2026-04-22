import React, { useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

export type ShowcaseAccent = 'violet' | 'cyan' | 'amber';

const RESUME_AFTER_MS = 4500;
/** Pixels advanced per frame (~60fps); ~0.45 → ~27px/s */
const AUTO_SCROLL_PX_PER_FRAME = 0.45;

const accentStyles: Record<
  ShowcaseAccent,
  {
    section: string;
    kicker: string;
  }
> = {
  violet: {
    section:
      'bg-gradient-to-br from-violet-500/[0.09] via-[var(--bg)] to-fuchsia-600/[0.07] dark:from-violet-500/15 dark:via-[var(--bg)] dark:to-fuchsia-700/12',
    kicker: 'text-violet-600 dark:text-violet-400',
  },
  cyan: {
    section:
      'bg-gradient-to-br from-cyan-500/[0.08] via-[var(--bg)] to-teal-600/[0.07] dark:from-cyan-500/12 dark:via-[var(--bg)] dark:to-teal-700/12',
    kicker: 'text-cyan-600 dark:text-cyan-400',
  },
  amber: {
    section:
      'bg-gradient-to-br from-amber-500/[0.08] via-[var(--bg)] to-orange-600/[0.07] dark:from-amber-500/12 dark:via-[var(--bg)] dark:to-orange-800/12',
    kicker: 'text-amber-700 dark:text-amber-400',
  },
};

interface HomeShowcaseRowProps {
  title: string;
  subtitle: string;
  /** When set, the title block links here (same as “View all” for list sections). Omit for multi-destination rows. */
  viewAllTo?: string;
  accent: ShowcaseAccent;
  children: React.ReactNode;
}

function duplicateForMarquee(children: React.ReactNode): React.ReactNode {
  const arr = React.Children.toArray(children);
  if (arr.length === 0) return children;

  const first = arr.map((child, i) =>
    React.isValidElement(child)
      ? React.cloneElement(child, { key: `marquee-a-${i}` } as React.Attributes)
      : child
  );
  const second = arr.map((child, i) =>
    React.isValidElement(child)
      ? React.cloneElement(child, { key: `marquee-b-${i}` } as React.Attributes)
      : child
  );
  return (
    <>
      {first}
      {second}
    </>
  );
}

/** Desktop hover: pause marquee while pointer is over the strip; resumes immediately on mouseleave. */
function canUseHoverPause(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

const HomeShowcaseRow: React.FC<HomeShowcaseRowProps> = ({
  title,
  subtitle,
  viewAllTo,
  accent,
  children,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  /** Paused by scroll/wheel/touch/keyboard until idle timer (not used for hover). */
  const pausedRef = useRef(false);
  /** Paused only while mouse is over the strip (desktop); cleared on mouseleave. */
  const hoverPausedRef = useRef(false);
  const fromAutoScrollRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const a = accentStyles[accent];

  const clearResumeTimer = () => {
    if (resumeTimerRef.current !== null) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const scheduleResume = useCallback(() => {
    clearResumeTimer();
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      resumeTimerRef.current = null;
    }, RESUME_AFTER_MS);
  }, []);

  const userIntervened = useCallback(() => {
    pausedRef.current = true;
    scheduleResume();
  }, [scheduleResume]);

  const scrollBy = (direction: 1 | -1) => {
    userIntervened();
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-showcase-card]');
    const step = card?.offsetWidth
      ? card.offsetWidth + 20
      : Math.min(el.clientWidth * 0.82, 340);
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (fromAutoScrollRef.current) return;
      userIntervened();
    };

    const onWheel = () => {
      userIntervened();
    };

    const onPointerDown = () => {
      userIntervened();
    };

    const onFocusIn = () => {
      userIntervened();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'PageUp' || e.key === 'PageDown') {
        userIntervened();
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('keydown', onKeyDown);

    const onMouseEnter = () => {
      if (!canUseHoverPause()) return;
      hoverPausedRef.current = true;
    };

    const onMouseLeave = () => {
      if (!canUseHoverPause()) return;
      hoverPausedRef.current = false;
    };

    const tick = () => {
      if (!pausedRef.current && !hoverPausedRef.current && el) {
        fromAutoScrollRef.current = true;
        el.scrollLeft += AUTO_SCROLL_PX_PER_FRAME;
        const half = el.scrollWidth / 2;
        if (half > 1 && el.scrollLeft >= half - 1) {
          el.scrollLeft -= half;
        }
        fromAutoScrollRef.current = false;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('focusin', onFocusIn);
      el.removeEventListener('keydown', onKeyDown);
      clearResumeTimer();
      hoverPausedRef.current = false;
    };
  }, [children, userIntervened]);

  return (
    <section className={`relative overflow-hidden py-14 md:py-20 px-4 ${a.section}`}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
          {viewAllTo ? (
            <Link
              to={viewAllTo}
              className="group block max-w-xl rounded-2xl -m-2 p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            >
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] mb-2 ${a.kicker}`}>
                View all
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--fg)] flex items-center gap-2 flex-wrap">
                <span className="bg-gradient-to-r from-[var(--fg)] to-[var(--muted)] bg-clip-text group-hover:from-[var(--primary)] group-hover:to-violet-600 dark:group-hover:to-cyan-400 transition-colors">
                  {title}
                </span>
                <ArrowUpRight
                  className="w-7 h-7 shrink-0 text-[var(--muted)] opacity-60 transition-all group-hover:opacity-100 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                />
              </h2>
              <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{subtitle}</p>
            </Link>
          ) : (
            <div className="max-w-xl">
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] mb-2 ${a.kicker}`}>Discover</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--fg)] flex items-center gap-2 flex-wrap">
                {title}
              </h2>
              <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{subtitle}</p>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollBy(-1)}
              className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] shadow-sm active:scale-95 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors touch-manipulation"
            >
              <ChevronLeft className="w-[1.15rem] h-[1.15rem] sm:w-[1.375rem] sm:h-[1.375rem]" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollBy(1)}
              className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] shadow-sm active:scale-95 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors touch-manipulation"
            >
              <ChevronRight className="w-[1.15rem] h-[1.15rem] sm:w-[1.375rem] sm:h-[1.375rem]" />
            </button>
          </div>
        </div>

        <div className="relative -mx-1 min-w-0">
          <div
            ref={scrollerRef}
            className="home-showcase-scroll flex gap-4 sm:gap-5 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x pb-4 pt-1 pl-1 pr-1 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
          >
            {duplicateForMarquee(children)}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 sm:w-10 md:w-14 bg-gradient-to-r from-[var(--bg)] to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 sm:w-10 md:w-14 bg-gradient-to-l from-[var(--bg)] to-transparent"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
};

export default HomeShowcaseRow;
