import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const WAIT_TOTAL = 28;
const WAIT_LINES = [
  'Waking up the server… have a little patience ⏳',
  'This can take ~28 seconds on the free tier…',
  'Getting your fellow mates online… 💬',
  'Brewing chai while the database stretches… 🍵',
  'Almost there — your chats are lining up… ✨',
];

// Cold-start countdown shown inside auth buttons while the request is pending.
export function useColdStartWait() {
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(WAIT_TOTAL);
  const timer = useRef(null);

  const start = () => {
    setBusy(true);
    setLeft(WAIT_TOTAL);
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
  };
  const stop = () => {
    clearInterval(timer.current);
    setBusy(false);
    setLeft(WAIT_TOTAL);
  };
  useEffect(() => () => clearInterval(timer.current), []);

  const line = WAIT_LINES[Math.min(WAIT_LINES.length - 1, Math.floor(((WAIT_TOTAL - left) / WAIT_TOTAL) * WAIT_LINES.length))];
  const box = busy ? (
    <div className="rounded-xl border border-violet-500/25 bg-violet-500/[0.07] p-3.5">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-violet-200 font-semibold">Connecting… {left > 0 ? `${left}s` : 'almost there…'}</span>
        <span className="w-4 h-4 border-2 border-violet-300 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000"
          style={{ width: `${((WAIT_TOTAL - left) / WAIT_TOTAL) * 100}%` }}
        />
      </div>
      <p className="text-xs text-white/55 leading-relaxed">{line}</p>
    </div>
  ) : null;

  return { busy, start, stop, box };
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const wait = useColdStartWait();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-white">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          wait.start();
          try { await login(form); navigate('/chats'); } catch (err) { setError(err.message); } finally { wait.stop(); }
        }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4"
      >
        <h1 className="text-xl font-bold">Welcome back</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} placeholder="Username or email" className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="Password" className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        {wait.box}
        <button disabled={wait.busy} className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-60">
          {wait.busy ? 'Connecting…' : 'Login'}
        </button>
        <p className="text-xs text-white/40">No account? <Link to="/register" className="text-white">Sign up</Link></p>
      </form>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', gender: '' });
  const [error, setError] = useState('');
  const wait = useColdStartWait();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-white">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          if (!form.gender) { setError('Please pick an avatar.'); return; }
          wait.start();
          try { await register(form); navigate('/chats'); } catch (err) { setError(err.message); } finally { wait.stop(); }
        }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4"
      >
        <h1 className="text-xl font-bold">Create your profile</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username (letters, numbers, _)" className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="Password (min 8)" className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <div>
          <p className="text-xs text-white/40 mb-2">Pick your avatar</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'MALE', label: '♂ Male', cls: 'from-sky-500/40 to-blue-600/25 text-sky-200', ring: 'border-sky-400/60 bg-sky-500/10' },
              { value: 'FEMALE', label: '♀ Female', cls: 'from-pink-500/40 to-rose-500/25 text-pink-200', ring: 'border-pink-400/60 bg-pink-500/10' },
            ].map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setForm({ ...form, gender: g.value })}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${form.gender === g.value ? g.ring : 'border-white/10 hover:border-white/25'}`}
              >
                <img src={g.value === 'FEMALE' ? '/avatars/female.svg' : '/avatars/male.svg'} alt={g.label} className="w-14 h-14 rounded-full object-cover border border-white/10 bg-white/5" />
                <span className="text-xs font-semibold">{g.label}</span>
              </button>
            ))}
          </div>
        </div>
        {wait.box}
        <button disabled={wait.busy} className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-60">
          {wait.busy ? 'Creating…' : 'Sign up'}
        </button>
        <p className="text-xs text-white/40">Have an account? <Link to="/login" className="text-white">Login</Link></p>
      </form>
    </div>
  );
}
