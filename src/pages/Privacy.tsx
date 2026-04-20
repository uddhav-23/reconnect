import React from 'react';
import Card from '../components/common/Card';

const Privacy: React.FC = () => (
  <div className="min-h-screen py-16 px-4">
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-4xl font-semibold text-[var(--fg)] mb-8">Privacy policy</h1>
      <Card variant="primary" className="p-8 space-y-6 text-[var(--fg)] text-sm leading-relaxed">
        <p className="text-[var(--muted)]">Last updated: April 2026</p>
        <section>
          <h2 className="font-semibold text-lg mb-2">Data we collect</h2>
          <p className="text-[var(--muted)]">
            We store account and profile information you provide (name, email, education, employment) in Firebase
            Authentication and Cloud Firestore. Usage of messaging, connections, and notifications generates
            additional records tied to your user ID.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2">How we use data</h2>
          <p className="text-[var(--muted)]">
            Data powers the alumni directory, blogs, events, jobs, mentorship, and group features. Administrators
            may access content for moderation and verification purposes.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2">Your choices</h2>
          <p className="text-[var(--muted)]">
            From your dashboard you may export a copy of your profile and authored content, or request account
            deletion. Deletion removes your auth account and primary user document; some historical records may
            require backend cleanup in production deployments.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2">Contact</h2>
          <p className="text-[var(--muted)]">Questions about privacy should be directed to your institution or platform operator.</p>
        </section>
      </Card>
    </div>
  </div>
);

export default Privacy;
