import { useState } from 'react';
import ChatRoom from '../components/ChatRoom.jsx';

// Legacy anonymous rooms (original ws flow, preserved). Uses the deployed
// legacy WS endpoint default in ChatRoom (VITE_WS_URL or wss://gupshup-ou0n.onrender.com).
export default function Guest() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [active, setActive] = useState(null);

  if (active) {
    return (
      <ChatRoom
        room={active.room}
        name={active.name}
        isNewRoom={active.isNew}
        onLeave={() => setActive(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <h1 className="text-xl font-bold">Guest rooms (no account)</h1>
        <p className="text-xs text-white/40">Original anonymous flow, kept working alongside the new social DMs.</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={20} className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Room code (for join)" maxLength={10} className="w-full bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <div className="flex gap-3">
          <button
            disabled={!name.trim()}
            onClick={() => {
              const room = Math.random().toString(36).substring(2, 8).toUpperCase();
              setActive({ room, name: name.trim(), isNew: true });
            }}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-40"
          >
            Create
          </button>
          <button
            disabled={!name.trim() || !code.trim()}
            onClick={() => setActive({ room: code.trim(), name: name.trim(), isNew: false })}
            className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
