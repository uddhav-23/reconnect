import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { listOpenReports } from '../../services/platformFirestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { ContentReport } from '../../types';

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<ContentReport[]>([]);

  const load = async () => {
    setReports(await listOpenReports());
  };

  useEffect(() => {
    load();
  }, []);

  const dismiss = async (id: string) => {
    await updateDoc(doc(db, 'reports', id), { status: 'dismissed' });
    await load();
  };

  return (
    <div className="space-y-3">
      {reports.length === 0 ? (
        <Card variant="primary" className="p-8 text-center text-[var(--muted)]">
          No open reports.
        </Card>
      ) : (
        reports.map((r) => (
          <Card key={r.id} variant="primary" className="p-4 flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--fg)]">
                {r.targetType} · {r.targetId}
              </p>
              <p className="text-xs text-[var(--muted)]">{r.reason}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => dismiss(r.id)}>
              Dismiss
            </Button>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminReports;
