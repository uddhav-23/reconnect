import React, { ReactNode } from 'react';

interface PageHeroProps {
  /** Small label above the title */
  eyebrow?: string;
  title: string;
  /** If set, only this substring is shown with gradient styling (first occurrence). */
  titleGradientPart?: string;
  subtitle?: ReactNode;
  /** Right-aligned actions (buttons) on md+ */
  actions?: ReactNode;
  /** Extra full-width content below title row (e.g. search bar) */
  children?: ReactNode;
  className?: string;
}

/**
 * Shared page header matching the landing page: mesh background, gradient accents.
 */
const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  titleGradientPart,
  subtitle,
  actions,
  children,
  className = '',
}) => {
  let titleNode: ReactNode = title;
  if (titleGradientPart && title.includes(titleGradientPart)) {
    const i = title.indexOf(titleGradientPart);
    const before = title.slice(0, i);
    const after = title.slice(i + titleGradientPart.length);
    titleNode = (
      <>
        {before}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-teal-500 dark:from-violet-400 dark:via-blue-400 dark:to-teal-400">
          {titleGradientPart}
        </span>
        {after}
      </>
    );
  }

  return (
    <section className={`home-hero-mesh border-b border-[var(--border)]/70 py-12 md:py-16 px-4 ${className}`}>
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-600 dark:from-violet-400 dark:to-cyan-400 mb-2">
                {eyebrow}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--fg)] leading-tight">
              {titleNode}
            </h1>
            {subtitle != null && subtitle !== '' && (
              <div className="mt-3 text-base md:text-lg text-[var(--muted)] max-w-2xl leading-relaxed">{subtitle}</div>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2 shrink-0 md:justify-end">{actions}</div>}
        </div>
        {children && <div className="mt-8 max-w-2xl mx-auto md:mx-0">{children}</div>}
      </div>
    </section>
  );
};

export default PageHero;
