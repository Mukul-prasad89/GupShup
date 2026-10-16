import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import Avatar from '../components/Avatar.jsx';

export default function Connections() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');
  const load = async () => {
    try {
      const d = await api.follows();
      setRows(d.follows); setState('done');
    } catch (err) { setState('error'); }
  };
  useEffect(() => { load(); }, []);

  const message = async (u) => {
    try {
      const d = await api.createDirect(u.id);
      navigate(`/chats/${d.conversation.id}`);
    } catch { /* not connected yet */ }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-10 text-white">
      <h1 className="text-2xl font-bold mb-8">Connected people</h1>
      {state === 'loading' && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
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
      {state === 'done' && rows.length === 0 && <p className="text-sm text-white/40">Empty results — find people in <Link to="/search" className="underline">Search</Link>.</p>}
      <div className="space-y-4">
        {rows.map((u) => (
          <div key={u.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <Avatar gender={u.gender} size="w-12 h-12" />
            <Link to={`/u/${u.username}`} className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{u.name} <span className="text-white/40 font-normal">@{u.username}</span></p>
              {u.bio && <p className="text-xs text-white/45 truncate mt-0.5">{u.bio}</p>}
            </Link>
            <button
              onClick={() => message(u)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              onClick={async () => { await api.unfollow(u.id); load(); }}
              className="px-3 py-2 text-xs rounded-xl border border-white/15 text-white/60 hover:text-white shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
