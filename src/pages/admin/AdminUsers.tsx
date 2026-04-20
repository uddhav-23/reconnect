import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllUsersAdmin } from '../../services/firebaseFirestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { User } from '../../types';
import { isAdmin } from '../../lib/roles';
import { useAuth } from '../../contexts/AuthContext';

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await getAllUsersAdmin());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const verify = async (id: string) => {
    await updateDoc(doc(db, 'users', id), { verifiedAlumni: true });
    await load();
  };

  if (loading) {
    return <p className="text-[var(--muted)]">Loading users…</p>;
  }

  return (
    <Card variant="primary" className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-[var(--border)] text-[var(--muted)]">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Verified</th>
            {isAdmin(user) && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-[var(--border)]/60">
              <td className="p-3 text-[var(--fg)]">{u.name}</td>
              <td className="p-3 text-[var(--muted)]">{u.email}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">{u.verifiedAlumni ? 'Yes' : 'No'}</td>
              {isAdmin(user) && u.role === 'alumni' && (
                <td className="p-3">
                  {!u.verifiedAlumni && (
                    <Button size="sm" variant="secondary" onClick={() => verify(u.id)}>
                      Verify
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default AdminUsers;
