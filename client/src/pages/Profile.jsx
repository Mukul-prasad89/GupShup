import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function Me() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? '', bio: user?.bio ?? '', avatarUrl: user?.avatarUrl ?? '', gender: user?.gender ?? 'MALE' });
  const [msg, setMsg] = useState('');
  useEffect(() => {
    setForm({ name: user?.name ?? '', bio: user?.bio ?? '', avatarUrl: user?.avatarUrl ?? '', gender: user?.gender ?? 'MALE' });
  }, [user]);
  return (
    <div className="max-w-xl mx-auto px-6 py-10 text-white">
      <h1 className="text-2xl font-bold">@{user?.username}</h1>
      <p className="text-sm text-white/40 mb-6">{user?.email}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault(); setMsg('');
          try {
            const d = await api.updateMe({ name: form.name, bio: form.bio || null, avatarUrl: form.avatarUrl || null, gender: form.gender });
            setUser(d.user); setMsg('Saved.');
          } catch (err) { setMsg(err.message); }
        }}
        className="space-y-3"
      >
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio (max 300)" className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="Avatar URL" className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none">
          <option value="MALE">♂ Male avatar</option>
          <option value="FEMALE">♀ Female avatar</option>
        </select>
        <button className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold">Save profile</button>
        {msg && <p className="text-sm text-white/50">{msg}</p>}
      </form>
    </div>
  );
}

export function UserProfile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState('loading');
  const [action, setAction] = useState('');

  const load = async () => {
    setState('loading');
    try {
      const d = await api.getUser(username);
      setProfile(d.user); setState('done');
    } catch (err) { setState('error'); setAction(err.message); }
  };
  useEffect(() => { load(); }, [username]);

  const connect = async () => {
    setAction('Sending…');
    try { await api.sendRequest(profile.id); setAction('Request pending.'); }
    catch (err) { setAction(err.message); }
  };

  const startChat = async () => {
    setAction('Opening…');
    try {
      const d = await api.createDirect(profile.id);
      window.location.href = `/chats/${d.conversation.id}`;
    } catch (err) { setAction(err.message); }
  };

  if (state === 'loading') return <p className="text-white/40 p-10">Loading…</p>;
  if (state === 'error') return <p className="text-red-400 p-10">{action || 'Not found'}</p>;
  const isMe = me?.id === profile.id;
  return (
    <div className="max-w-xl mx-auto px-6 py-10 text-white">
      <h1 className="text-2xl font-bold">{profile.name} <span className="text-white/40">@{profile.username}</span></h1>
      {profile.bio && <p className="text-white/60 mt-2">{profile.bio}</p>}
      {!isMe && (
        <div className="flex gap-3 mt-6">
          <button onClick={connect} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold">Connect / Follow</button>
          <button onClick={startChat} className="px-4 py-2 rounded-xl border border-white/15 text-sm">Message (if connected)</button>
        </div>
      )}
      {action && <p className="text-sm text-white/50 mt-4">{action}</p>}
    </div>
  );
}
