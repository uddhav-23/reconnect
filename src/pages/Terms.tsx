import React from 'react';
import Card from '../components/common/Card';
import PageHero from '../components/layout/PageHero';

const Terms: React.FC = () => (
  <div className="min-h-screen">
    <PageHero eyebrow="Legal" title="Terms of use" titleGradientPart="Terms" subtitle="Rules for using Reconnect." />
    <div className="container mx-auto max-w-3xl px-4 pb-16 -mt-2">
      <Card variant="primary" className="p-6 sm:p-8 space-y-6 text-[var(--fg)] text-sm leading-relaxed border-violet-500/10">
        <p className="text-[var(--muted)]">Last updated: April 2026</p>
        <section>
          <h2 className="font-semibold text-lg mb-2">Acceptance</h2>
          <p className="text-[var(--muted)]">
            By accessing Reconnect you agree to these terms and to use the platform respectfully. You are responsible
            for the accuracy of information in your profile and posts.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2">Conduct</h2>
          <p className="text-[var(--muted)]">
            Harassment, spam, illegal content, and impersonation are prohibited. Administrators may remove content,
            suspend accounts, or verify alumni status at their discretion.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2">Disclaimer</h2>
          <p className="text-[var(--muted)]">
            Job listings and events are user-generated. The platform does not guarantee outcomes from applications,
            mentorship, or networking interactions.
          </p>
        </section>
      </Card>
    </div>
  </div>
);

export default Terms;
