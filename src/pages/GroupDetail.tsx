import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Users } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { getGroupById, joinGroup, subscribeGroupMessages, sendGroupMessage, GroupMessage } from '../services/platformFirestore';
import { getUserById } from '../services/firebaseFirestore';
import type { Group } from '../types';

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [text, setText] = useState('');
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      const g = await getGroupById(id);
      setGroup(g);
    })();
  }, [id]);

  useEffect(() => {
    if (!id || !group || !user?.id) return;
    const unsub = subscribeGroupMessages(id, setMessages);
    return () => unsub();
  }, [id, group, user?.id]);

  useEffect(() => {
    const load = async () => {
      const nm: Record<string, string> = {};
      for (const m of messages) {
        if (!nm[m.senderId]) {
          const u = await getUserById(m.senderId);
          nm[m.senderId] = u?.name || m.senderId;
        }
      }
      setNames((prev) => ({ ...prev, ...nm }));
    };
    if (messages.length) load();
  }, [messages]);

  const join = async () => {
    if (!user || !group) return;
    await joinGroup(group.id, user.id);
    const g = await getGroupById(group.id);
    setGroup(g);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !group || !text.trim()) return;
    if (!group.members?.includes(user.id)) {
      alert('Join the group to chat.');
      return;
    }
    await sendGroupMessage(group.id, user.id, text.trim());
    setText('');
  };

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  const isMember = user && group.members?.includes(user.id);

  return (
    <div className="min-h-screen py-8 px-4 container mx-auto max-w-3xl flex flex-col">
      <Button variant="secondary" className="mb-4 self-start flex items-center gap-2" onClick={() => navigate('/groups')}>
        <ArrowLeft size={16} />
        All groups
      </Button>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--fg)]">{group.name}</h1>
          <p className="text-sm text-[var(--muted)] mt-1 uppercase">{group.type}</p>
          <p className="text-[var(--muted)] mt-4 whitespace-pre-wrap">{group.description}</p>
          <p className="text-sm text-[var(--muted)] mt-4 flex items-center gap-2">
            <Users size={16} />
            {group.members?.length || 0} members
          </p>
        </div>
        {user && !isMember && (
          <Button variant="primary" onClick={join}>
            Join
          </Button>
        )}
      </div>

      <Card variant="primary" className="flex-1 flex flex-col p-4 min-h-[360px]">
        <h2 className="text-sm font-medium text-[var(--fg)] mb-3">Group chat</h2>
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[320px]">
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-medium text-[var(--primary)]">{names[m.senderId] || '…'}: </span>
              <span className="text-[var(--fg)]">{m.content}</span>
            </div>
          ))}
        </div>
        {isMember ? (
          <form onSubmit={send} className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message the group…"
            />
            <Button type="submit" variant="primary" className="flex items-center gap-1">
              <Send size={16} />
            </Button>
          </form>
        ) : (
          <p className="text-sm text-[var(--muted)]">Join to participate in chat.</p>
        )}
      </Card>
    </div>
  );
};

export default GroupDetail;
