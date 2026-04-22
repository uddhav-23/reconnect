import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Building2,
  Calendar,
  BadgeCheck,
  Linkedin,
  Github,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import type { Alumni } from '../../types';

interface AlumniDirectoryCardProps {
  alumni: Alumni;
}

/**
 * Compact directory row/card aligned with the marketing UI (gradient accent, tight typography).
 */
const AlumniDirectoryCard: React.FC<AlumniDirectoryCardProps> = ({ alumni: a }) => {
  const initials = a.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const skillPreview = (a.skills || []).slice(0, 3);
  const skillExtra = (a.skills || []).length - skillPreview.length;

  return (
    <div className="group relative rounded-xl p-[1px] bg-gradient-to-br from-violet-500/35 via-fuchsia-500/20 to-cyan-500/30 shadow-md hover:shadow-lg transition-all duration-200">
      <div className="h-full rounded-[11px] bg-[var(--card)] border border-white/10 dark:border-white/5 overflow-hidden flex flex-col sm:flex-row gap-4 p-4">
        <div className="flex sm:flex-col items-center sm:items-stretch gap-3 shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
            {initials}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[var(--fg)] text-base leading-snug truncate">{a.name}</h3>
                {a.verifiedAlumni && (
                  <span className="text-emerald-600 dark:text-emerald-400 shrink-0" title="Verified alumni">
                    <BadgeCheck size={16} />
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--muted)] truncate">
                {a.currentPosition || 'Alumni'}
                {a.currentCompany ? ` · ${a.currentCompany}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)] mt-1">
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} className="text-violet-500 shrink-0" />
              Class of {a.graduationYear}
            </span>
            {a.location && (
              <span className="inline-flex items-center gap-1 min-w-0">
                <MapPin size={12} className="text-cyan-600 shrink-0" />
                <span className="truncate">{a.location}</span>
              </span>
            )}
            {a.currentCompany && (
              <span className="inline-flex items-center gap-1 min-w-0 hidden sm:inline-flex">
                <Building2 size={12} className="text-fuchsia-500 shrink-0" />
                <span className="truncate">{a.currentCompany}</span>
              </span>
            )}
          </div>

          <p className="text-xs leading-relaxed text-[var(--muted)] mt-2 line-clamp-2">
            {a.degree}
            {a.department ? ` · ${a.department}` : ''}
          </p>

          {a.bio && (
            <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{a.bio}</p>
          )}

          {skillPreview.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skillPreview.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-md border border-violet-200/70 bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-800 dark:border-violet-500/25 dark:bg-violet-950/40 dark:text-violet-200"
                >
                  {skill}
                </span>
              ))}
              {skillExtra > 0 && (
                <span className="text-[10px] font-medium text-[var(--muted)] self-center">+{skillExtra}</span>
              )}
            </div>
          )}

          <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)]/80">
            <span className="text-[11px] font-medium text-[var(--muted)]">
              {(a.achievements || []).length} achievement{(a.achievements || []).length === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-2">
              {a.socialLinks && a.profileVisibility !== 'private' && (
                <div className="flex gap-1">
                  {a.socialLinks.linkedin && (
                    <a
                      href={a.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:border-violet-400/50 transition-colors"
                      aria-label="LinkedIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Linkedin size={14} className="text-[var(--muted)]" />
                    </a>
                  )}
                  {a.socialLinks.github && (
                    <a
                      href={a.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:border-violet-400/50 transition-colors"
                      aria-label="GitHub"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github size={14} className="text-[var(--muted)]" />
                    </a>
                  )}
                  {a.socialLinks.personal && (
                    <a
                      href={a.socialLinks.personal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:border-violet-400/50 transition-colors"
                      aria-label="Website"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} className="text-[var(--muted)]" />
                    </a>
                  )}
                </div>
              )}
              <Link
                to={`/alumni/${a.id}`}
                className="inline-flex items-center justify-center gap-1 shrink-0 rounded-lg h-8 px-3 text-xs font-semibold bg-[var(--primary)] text-[var(--primary-fg)] hover:opacity-90 shadow-md transition-opacity"
              >
                Profile
                <ArrowRight size={14} className="opacity-90 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDirectoryCard;
