import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, UserPlus } from 'lucide-react';
import { api } from '../lib/api.js';
import Avatar from '../components/Avatar.jsx';

export default function Search() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const loadAll = async () => {
    setState('loading'); setError('');
    try {
      const [all, follows, sent] = await Promise.all([
        api.allUsers(),
        api.follows().catch(() => ({ follows: [] })),
        api.sentRequests().catch(() => ({ requests: [] })),
      ]);
      setUsers(all.users);
      setConnectedIds(new Set((follows.follows ?? []).map((u) => u.id)));
      setRequestedIds(new Set((sent.requests ?? []).map((r) => r.receiverId ?? r.receiver?.id).filter(Boolean)));
      setState('done');
    } catch (err) { setError(err.message); setState('error'); }
  };

  useEffect(() => { loadAll(); }, []);

  const run = async (e) => {
    e?.preventDefault();
    if (q.trim().length < 2) { loadAll(); return; }
    setState('loading'); setError('');
    try {
      const d = await api.searchUsers(q.trim());
      setUsers(d.users);
      setState('done');
    } catch (err) { setError(err.message); setState('error'); }
  };

  const connect = async (u) => {
    try {
      await api.sendRequest(u.id);
      setRequestedIds((s) => new Set(s).add(u.id));
    } catch {
      setRequestedIds((s) => new Set(s).add(u.id));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-10 text-white">
      <h1 className="text-2xl font-bold mb-6">Find people</h1>
      <form onSubmit={run} className="flex gap-3 mb-8">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username or name (min 2 chars)" className="flex-1 bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <button className="px-5 rounded-xl bg-white text-black text-sm font-semibold">Search</button>
      </form>
      {state === 'loading' && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-white/[0.07]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/5 rounded-full bg-white/[0.08]" />
                <div className="h-3 w-3/5 rounded-full bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      )}
      {state === 'error' && <p className="text-sm text-red-400">{error}</p>}
      {state === 'done' && users.length === 0 && <p className="text-sm text-white/40">Empty results.</p>}
      <div className="space-y-3">
        {users.map((u) => {
          const connected = connectedIds.has(u.id);
          const requested = requestedIds.has(u.id);
          return (
            <div key={u.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <Avatar gender={u.gender} size="w-12 h-12" />
              <Link to={`/u/${u.username}`} className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{u.name} <span className="text-white/40 font-normal">@{u.username}</span></p>
                {u.bio && <p className="text-xs text-white/45 truncate mt-0.5">{u.bio}</p>}
              </Link>
              {connected ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-300 shrink-0"><Check className="w-3.5 h-3.5" /> Connected</span>
              ) : (
                <button
                  onClick={() => connect(u)}
                  disabled={requested}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold shrink-0 disabled:opacity-40"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {requested ? 'Requested' : 'Follow'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
