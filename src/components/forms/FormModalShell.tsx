import React from 'react';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Button from '../common/Button';

type Tint = 'violet' | 'cyan' | 'amber' | 'rose' | 'slate';

const sectionTint: Record<
  Tint,
  string
> = {
  violet:
    'border-violet-500/20 bg-gradient-to-br from-violet-50/90 via-[var(--card)] to-[var(--card)] dark:from-violet-950/35 dark:via-[var(--card)] dark:to-[var(--card)]',
  cyan:
    'border-cyan-500/20 bg-gradient-to-br from-cyan-50/90 via-[var(--card)] to-[var(--card)] dark:from-cyan-950/30 dark:via-[var(--card)] dark:to-[var(--card)]',
  amber:
    'border-amber-500/20 bg-gradient-to-br from-amber-50/90 via-[var(--card)] to-[var(--card)] dark:from-amber-950/30 dark:via-[var(--card)] dark:to-[var(--card)]',
  rose:
    'border-rose-500/20 bg-gradient-to-br from-rose-50/90 via-[var(--card)] to-[var(--card)] dark:from-rose-950/30 dark:via-[var(--card)] dark:to-[var(--card)]',
  slate:
    'border-[var(--border)] bg-[var(--card)]/95 dark:bg-neutral-900/40',
};

const iconTint: Record<Tint, string> = {
  violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  cyan: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  slate: 'bg-neutral-200 dark:bg-neutral-700 text-[var(--fg)]',
};

export function FormModalShell({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
  wide,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  onClose: () => void;
  children: React.ReactNode;
  /** Use max-w-4xl for long forms */
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
      <div
        className={`relative w-full ${wide ? 'max-w-4xl' : 'max-w-2xl'} max-h-[min(92dvh,920px)] flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        <div className="app-surface border-violet-500/15 shadow-2xl shadow-violet-500/[0.07] dark:shadow-black/40 flex flex-col max-h-[min(92dvh,920px)] overflow-hidden">
          <div className="shrink-0 flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[var(--border)]/80 bg-gradient-to-r from-violet-500/[0.06] to-cyan-500/[0.06] dark:from-violet-950/40 dark:to-cyan-950/30">
            <div className="flex gap-4 min-w-0">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25">
                <Icon size={22} strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                {eyebrow && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-600 dark:from-violet-400 dark:to-cyan-400 mb-1">
                    {eyebrow}
                  </p>
                )}
                <h2 id="form-modal-title" className="text-xl sm:text-2xl font-bold text-[var(--fg)] tracking-tight">
                  {title}
                </h2>
                {subtitle && <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{subtitle}</p>}
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="shrink-0 rounded-xl h-10 w-10 p-0 border-[var(--border)]"
              aria-label="Close"
            >
              <X size={20} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FormSection({
  title,
  subtitle,
  icon: Icon,
  tint = 'violet',
  children,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  tint?: Tint;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border p-4 sm:p-5 ${sectionTint[tint]}`}>
      <div className="flex items-start gap-3 mb-4">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTint[tint]}`}>
          <Icon size={18} strokeWidth={2.25} />
        </span>
        <div>
          <h3 className="font-bold text-[var(--fg)] text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

/** Native select styled like app inputs */
export const selectClassName =
  'app-input w-full min-h-[46px] cursor-pointer appearance-none bg-[var(--card)]';
