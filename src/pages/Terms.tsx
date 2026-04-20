import React from 'react';
import Card from '../components/common/Card';

const Terms: React.FC = () => (
  <div className="min-h-screen py-16 px-4">
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-4xl font-semibold text-[var(--fg)] mb-8">Terms of use</h1>
      <Card variant="primary" className="p-8 space-y-6 text-[var(--fg)] text-sm leading-relaxed">
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
