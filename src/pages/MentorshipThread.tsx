import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Send, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeMentorshipMessages,
  addMentorshipMessage,
  getMentorshipById,
} from '../services/platformFirestore';
import { getUserById } from '../services/firebaseFirestore';
import type { Mentorship, MentorshipMessage } from '../types';

const MentorshipThread: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [messages, setMessages] = useState<MentorshipMessage[]>([]);
  const [text, setText] = useState('');
  const [peerName, setPeerName] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const m = await getMentorshipById(id);
      if (cancelled) return;
      if (!m || (m.mentorId !== user.id && m.menteeId !== user.id)) {
        setMentorship(null);
        setLoading(false);
        return;
      }
      setMentorship(m);
      const otherId = m.mentorId === user.id ? m.menteeId : m.mentorId;
      const ou = await getUserById(otherId);
      if (!cancelled) setPeerName(ou?.name || otherId);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const chatOpen = mentorship?.status === 'accepted' || mentorship?.status === 'completed';

  useEffect(() => {
    if (!id || !user || !chatOpen) return;
    const unsub = subscribeMentorshipMessages(id, setMessages);
    return () => unsub();
  }, [id, user, chatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !text.trim() || !chatOpen) return;
    try {
      await addMentorshipMessage(id, user.id, text.trim());
      setText('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not send');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading thread…</p>
      </div>
    );
  }

  if (!mentorship || !id) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-[var(--fg)] font-medium">This mentorship was not found or you don&apos;t have access.</p>
        <Button variant="primary" className="rounded-xl" to="/mentorship/hub">
          Back to mentorship hub
        </Button>
      </div>
    );
  }

  const isMentor = mentorship.mentorId === user.id;

  return (
    <div className="min-h-screen flex flex-col">
      <section className="home-hero-mesh border-b border-[var(--border)]/70 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <Button
            variant="secondary"
            className="mb-5 flex items-center gap-2 rounded-xl"
            onClick={() => navigate('/mentorship/hub')}
          >
            <ArrowLeft size={16} />
            Mentorship hub
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
              <Sparkles size={26} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-600 dark:from-violet-400 dark:to-cyan-400 mb-1">
                Mentorship thread
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--fg)] tracking-tight leading-tight">{mentorship.topic}</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {isMentor ? 'Mentee' : 'Mentor'}: <span className="font-medium text-[var(--fg)]">{peerName}</span>
                {' · '}
                <span
                  className={
                    mentorship.status === 'accepted' || mentorship.status === 'completed'
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-amber-600 dark:text-amber-400 font-medium'
                  }
                >
                  {mentorship.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1 container mx-auto max-w-3xl px-4 py-6">
        {!chatOpen ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
            <GraduationCap className="mx-auto text-violet-500/80 mb-4" size={48} />
            <p className="font-semibold text-[var(--fg)] mb-2">
              {mentorship.status === 'pending'
                ? isMentor
                  ? 'Waiting for your response'
                  : 'Waiting for your mentor'
                : 'This mentorship is not active'}
            </p>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-md mx-auto mb-6">
              {mentorship.status === 'pending' &&
                (isMentor
                  ? 'Accept this request from the mentorship hub to unlock messaging.'
                  : 'Your mentor must accept your request before you can chat here.')}
              {mentorship.status === 'declined' && 'This request was declined. Messaging is disabled.'}
            </p>
            {isMentor && mentorship.status === 'pending' && (
              <Button variant="primary" className="rounded-xl" to="/mentorship/hub">
                Respond in hub
              </Button>
            )}
          </div>
        ) : (
          <div className="app-surface border-violet-500/15 flex flex-col min-h-[min(70vh,720px)] max-h-[85dvh] overflow-hidden shadow-xl shadow-violet-500/[0.06]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[var(--bg)]">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-[var(--muted)] py-12">
                  No messages yet — say hello and agree on next steps.
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.senderId === user.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          mine
                            ? 'rounded-br-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
                            : 'rounded-bl-md bg-[var(--card)] border border-[var(--border)] text-[var(--fg)]'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={send} className="border-t border-[var(--border)]/80 bg-[var(--card)]/95 backdrop-blur-sm p-4 flex gap-2">
              <input
                className="app-input flex-1 min-w-0 bg-[var(--bg)]"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a mentorship message…"
              />
              <Button type="submit" variant="primary" className="rounded-xl shrink-0 gap-2 px-4">
                <Send size={18} />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipThread;
