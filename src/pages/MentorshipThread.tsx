import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  subscribeMentorshipMessages,
  addMentorshipMessage,
  MentorshipMessage,
} from '../services/platformFirestore';

const MentorshipThread: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MentorshipMessage[]>([]);
  const [text, setText] = useState('');
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const s = await getDoc(doc(db, 'mentorships', id));
      if (!s.exists()) {
        setAllowed(false);
        return;
      }
      const d = s.data();
      setAllowed(d.mentorId === user.id || d.menteeId === user.id);
    })();
  }, [id, user]);

  useEffect(() => {
    if (!id || !allowed) return;
    const unsub = subscribeMentorshipMessages(id, setMessages);
    return () => unsub();
  }, [id, allowed]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !text.trim()) return;
    await addMentorshipMessage(id, user.id, text.trim());
    setText('');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!allowed && id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6">Not authorized.</Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto py-8 px-4">
      <Button variant="secondary" className="mb-4 self-start flex items-center gap-2" onClick={() => navigate('/mentorship')}>
        <ArrowLeft size={16} />
        Back
      </Button>
      <Card variant="primary" className="flex-1 flex flex-col p-4 min-h-[400px]">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg px-3 py-2 max-w-[85%] text-sm ${
                m.senderId === user.id
                  ? 'bg-[var(--primary)] text-white ml-auto'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-[var(--fg)]'
              }`}
            >
              {m.content}
            </div>
          ))}
        </div>
        <form onSubmit={send} className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
          />
          <Button type="submit" variant="primary" className="flex items-center gap-1">
            <Send size={16} />
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default MentorshipThread;
