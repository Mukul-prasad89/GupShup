import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SquarePen } from 'lucide-react';
import { api } from '../lib/api.js';
import { chatCache } from '../lib/chatCache.js';
import { attachPresence } from '../lib/presence.js';
import { usePresence } from '../hooks/usePresence.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';
import Avatar from './Avatar.jsx';

function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d`;
  return `${Math.floor(s / (7 * 86400))}w`;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-white/[0.07] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/5 rounded-full bg-white/[0.08]" />
        <div className="h-3 w-4/5 rounded-full bg-white/[0.05]" />
      </div>
    </div>
  );
}

function SkeletonBubble({ mine }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-pulse`}>
      <div className={`h-10 rounded-3xl bg-white/[0.07] ${mine ? 'w-40' : 'w-56'}`} />
    </div>
  );
}

function Thread({ conversationId }) {
  const threadOnline = usePresence();
  const { user } = useAuth();
  const { shared } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [other, setOther] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    setLoadingMsgs(true);
    api.messages(conversationId, { limit: 50 }).then((d) => setMessages(d.messages)).catch(() => {}).finally(() => setLoadingMsgs(false));
    const s = shared();
    if (s) {
      const join = () => s.emit('conversation:join', { conversationId }, () => {});
      join(); // initial join
      s.on('connect', join); // re-join after reconnects (queued emits can be lost)
      const onNew = (m) => {
        if (m.conversationId !== conversationId) return;
        setMessages((p) => (p.some((x) => x.id === m.id) ? p : [...p, { ...m, senderId: m.sender?.id }])); 
      };
      s.on('message:new', onNew);
      return () => { s.off('message:new', onNew); s.off('connect', join); s.emit('conversation:leave', { conversationId }); };
    }
  }, [conversationId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    api.conversations().then((d) => {
      const c = (d.conversations ?? []).find((x) => x.id === conversationId);
      if (c) setOther(c.other);
    }).catch(() => {});
  }, [conversationId]);

  const send = () => {
    const text = input.trim();
    const s = shared();
    if (!text || !s) return;
    const clientMessageId = crypto.randomUUID();
    const optimistic = { id: `pending-${clientMessageId}`, content: text, senderId: user.id, sender: user, pending: true, createdAt: new Date().toISOString() };
    setMessages((p) => [...p, optimistic]);
    setInput('');
    s.emit('message:send', { conversationId, content: text, clientMessageId }, (res) => {
      if (!res?.ok) {
        // Rollback optimistic on failure.
        setMessages((p) => p.filter((m) => m.id !== optimistic.id));
      } else {
        // Broadcast may have arrived first and already appended the real message
        // (ids differ from the optimistic one, so dedupe-by-id can't catch it).
        // If real is already there, drop optimistic; else swap it in place.
        setMessages((p) =>
          p.some((m) => m.id === res.message.id)
            ? p.filter((m) => m.id !== optimistic.id)
            : p.map((m) => (m.id === optimistic.id ? { ...res.message, senderId: res.message.sender?.id ?? user.id } : m)),
        );
      }
    });
  };

  if (!conversationId) {
    return (
      <div className="flex-1 hidden md:flex items-center justify-center text-white/30 text-sm">
        Select a conversation to start messaging.
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col min-w-0 bg-black">
      <header className={`sticky top-0 z-10 px-4 sm:px-6 py-4 border-b flex items-center gap-3 bg-black/85 backdrop-blur-md transition-all duration-300 ${scrolled ? 'border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.55)]' : 'border-white/10'}`}>
        {conversationId && (
          <button onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = '/chats')} aria-label="Back" className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 text-xl leading-none">
            ←
          </button>
        )}
        <Avatar gender={other?.gender} size="w-10 h-10" online={threadOnline.has(other?.id)} />
        <div>
          <p className="font-semibold text-sm">{other?.name ?? 'Chat'}</p>
          <p className="text-xs text-white/40">@{other?.username ?? ''}{other?.id && threadOnline.has(other.id) ? ' · ' : ''}{other?.id && threadOnline.has(other.id) ? <span className="text-emerald-300">Active now</span> : ''}</p>
        </div>
      </header>
      <div
        ref={scrollRef}
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 12)}
        className="relative z-0 flex-1 overflow-y-auto px-6 py-6 flex flex-col"
      >
        {/* fade mask under the fixed header while scrolled */}
        <div className={`pointer-events-none sticky top-0 -mx-6 -mt-6 px-6 pt-6 h-10 bg-gradient-to-b from-black to-transparent transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
        <div className="flex-1" />
        <div className="space-y-3">
          {loadingMsgs && (
            <>
              <SkeletonBubble mine={false} />
              <SkeletonBubble mine />
              <SkeletonBubble mine={false} />
            </>
          )}
          {messages.map((m) => {
            const senderId = m.senderId ?? m.sender?.id;
            const mine = senderId != null && user?.id != null && String(senderId) === String(user.id);
            const senderName = m.sender?.name ?? m.sender?.username ?? '';
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col max-w-[70%] ${mine ? 'items-end' : 'items-start'}`}>
                  {!mine && senderName && (
                    <span className="text-[11px] text-violet-300/80 mb-1 ml-1">{senderName}</span>
                  )}
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed shadow-lg ${
                      mine
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-3xl rounded-br-lg'
                        : 'bg-neutral-800/90 border border-white/[0.06] text-neutral-100 rounded-3xl rounded-bl-lg'
                    } ${m.pending ? 'opacity-60' : ''}`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-white/25 mt-1 mx-1">
                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 bg-neutral-900 border border-white/10 rounded-full px-5 py-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Message…" className="flex-1 bg-transparent outline-none text-sm placeholder-white/30" autoFocus />
          <button onClick={send} disabled={!input.trim()} className="text-sm font-semibold text-violet-400 disabled:opacity-30">Send</button>
        </div>
      </div>
    </div>
  );
}

export default function ChatLayout({ selectedId }) {
  const { user } = useAuth();
  const { shared } = useSocket();
  const onlineUsers = usePresence();
  const navigate = useNavigate();
  const [tab, setTab] = useState('primary');
  const [query, setQuery] = useState('');
  const [convos, setConvos] = useState(() => chatCache.getConvos());
  const [suggestions, setSuggestions] = useState(() => chatCache.getSuggestions());
  const [requestsCount, setRequestsCount] = useState(() => chatCache.getRequestsCount() ?? 0);
  const [listLoading, setListLoading] = useState(() => !chatCache.hasConvos());

  useEffect(() => {
    // Render instantly from cache; revalidate silently unless cache is fresh.
    // New followers / conversations appear via this refresh or live socket events.
    const needConvos = !chatCache.convosFresh();
    const needSugg = !chatCache.suggestionsFresh();
    if (!needConvos && !needSugg) return;
    if (needConvos) {
      if (!chatCache.hasConvos()) setListLoading(true);
      api.conversations().then((d) => {
        chatCache.setConvos(d.conversations ?? []);
        setConvos(d.conversations ?? []);
      }).catch(() => {}).finally(() => setListLoading(false));
    }
    api.receivedRequests().then((d) => {
      chatCache.setRequestsCount((d.requests ?? []).length);
      setRequestsCount((d.requests ?? []).length);
    }).catch(() => {});
    if (needSugg) {
      Promise.all(['an', 'ar', 'di', 'pr', 'ro', 'sn'].map((q) => api.searchUsers(q).catch(() => ({ users: [] })))).then((results) => {
        const seen = new Map();
        for (const r of results) for (const u of r.users ?? []) if (!seen.has(u.id)) seen.set(u.id, u);
        const rows = [...seen.values()].slice(0, 8);
        chatCache.setSuggestions(rows);
        setSuggestions(rows);
      });
    }
  }, []);

  // Global live listener: bumps previews/reorders even when the thread isn't open.
  // Thread appends its own messages; both dedupe by id so no doubles.
  useEffect(() => {
    const s = shared();
    if (!s) return;
    attachPresence(s);
    const onNew = (m) => {
      setConvos((prev) => {
        const i = prev.findIndex((c) => c.id === m.conversationId);
        if (i === -1) {
          // Brand-new conversation (e.g. someone just connected) — full refresh.
          api.conversations().then((d) => {
            chatCache.setConvos(d.conversations ?? []);
            setConvos(d.conversations ?? []);
          }).catch(() => {});
          return prev;
        }
        const updated = [...prev];
        updated[i] = { ...updated[i], lastMessage: { content: m.content, createdAt: m.createdAt }, updatedAt: m.createdAt };
        updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        chatCache.setConvos(updated);
        return updated;
      });
    };
    s.on('message:new', onNew);
    return () => { s.off('message:new', onNew); };
  }, []);

  const convoPeople = convos.map((c) => ({
    kind: 'convo', id: c.id,
    otherId: c.other?.id,
    name: c.other?.name ?? '?', username: c.other?.username ?? '?',
    gender: c.other?.gender,
    preview: c.lastMessage?.content ?? 'Say hello.',
    ts: c.lastMessage?.createdAt ?? c.updatedAt,
  }));
  const q = query.trim().toLowerCase();
  const filteredSuggestions = suggestions
    .filter((u) => !convos.some((c) => c.other?.id === u.id))
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.username.includes(q))
    .map((u) => ({ kind: 'user', id: u.id, name: u.name, username: u.username, preview: u.bio ?? 'Say hello.', ts: null, raw: u }));
  const filteredConvos = convoPeople.filter((p) => !q || p.name.toLowerCase().includes(q) || p.username.includes(q));

  return (
    <div className="flex h-[100dvh] md:h-[calc(100vh-0px)] text-white">
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] shrink-0 border-r border-white/10 flex-col min-h-0 bg-[#0a0a0b]`}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">{user?.username ?? 'Messages'}</h1>
          <button onClick={() => navigate('/search')} title="New message" className="p-2 rounded-lg hover:bg-white/10">
            <SquarePen className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-3">
          <div className="flex items-center gap-3 bg-neutral-800/80 rounded-full px-4 py-2.5 border border-transparent focus-within:border-violet-400/50 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all">
            <Search className="w-4 h-4 text-amber-200/60" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="flex-1 bg-transparent outline-none text-sm placeholder-white/40" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-6">
          {listLoading && (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          )}
          {filteredConvos.map((p) => {
            const fresh = p.ts && Date.now() - new Date(p.ts).getTime() < 3600e3;
            const active = selectedId === p.id;
            return (
            <button key={p.id} onClick={() => navigate(`/chats/${p.id}`)} className={`w-full flex items-center gap-3 mx-3 my-1 px-3 py-2.5 rounded-2xl text-left border transition-all ${active ? 'bg-gradient-to-r from-violet-600/[0.18] via-fuchsia-500/[0.08] to-amber-400/[0.10] border-violet-400/30 shadow-[0_0_20px_rgba(139,92,246,0.12)]' : 'border-transparent hover:bg-white/[0.04] hover:border-white/10'}`} style={{ width: 'calc(100% - 24px)' }}>
              <Avatar gender={p.gender ?? p.raw?.gender} size="w-12 h-12" online={p.otherId ? onlineUsers.has(p.otherId) : onlineUsers.has(p.id)} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] truncate">{p.name}</p>
                <p className="text-[13px] text-white/40 truncate">{p.preview}{p.ts ? ` · ${timeAgo(p.ts)}` : ''}</p>
              </div>
              {fresh && !active && <span className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)] shrink-0" />}
            </button>
            );
          })}
          {filteredSuggestions.length > 0 && (
            <div className="flex items-center gap-2 px-5 pt-4 pb-1">
              <span className="text-[11px] font-semibold text-amber-200/70 uppercase tracking-[0.2em]">Suggested</span>
              <span className="flex-1 h-px bg-gradient-to-r from-amber-300/40 via-fuchsia-400/20 to-transparent" />
            </div>
          )}
          {filteredSuggestions.map((p) => (
            <button key={p.id} onClick={() => navigate(`/u/${p.username}`)} className="w-full flex items-center gap-3 mx-3 my-1 px-3 py-2.5 rounded-2xl text-left border border-transparent hover:bg-white/[0.04] hover:border-amber-200/20 transition-all" style={{ width: 'calc(100% - 24px)' }}>
              <Avatar gender={p.gender ?? p.raw?.gender} size="w-12 h-12" online={onlineUsers.has(p.id)} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] truncate">{p.name}</p>
                <p className="text-[13px] text-white/40 truncate">{p.preview}</p>
              </div>
            </button>
          ))}
          {filteredConvos.length === 0 && filteredSuggestions.length === 0 && (
            <p className="px-5 py-6 text-sm text-white/30">No matches.</p>
          )}
        </div>
      </div>
      <Thread conversationId={selectedId} />
    </div>
  );
}
