import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function Requests() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const load = async () => {
    setState('loading'); setError('');
    try {
      const [r, s] = await Promise.all([api.receivedRequests(), api.sentRequests()]);
      setReceived(r.requests); setSent(s.requests); setState('done');
    } catch (err) { setError(err.message); setState('error'); }
  };
  useEffect(() => { load(); }, []);

  const act = async (fn) => {
    try { await fn(); await load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-white">
      <h1 className="text-2xl font-bold mb-6">Follow requests</h1>
      {state === 'loading' && <p className="text-white/40 text-sm">Loading…</p>}
      {state === 'error' && <p className="text-red-400 text-sm">{error}</p>}
      {state === 'done' && (
        <>
          <h2 className="font-semibold mb-3">Incoming ({received.length})</h2>
          {received.length === 0 && <p className="text-sm text-white/40 mb-6">No incoming requests.</p>}
          <div className="space-y-3 mb-10">
            {received.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <span className="text-sm">@{r.sender?.username} — {r.sender?.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => act(() => api.respondRequest(r.id, 'accept'))} className="px-3 py-1.5 text-xs rounded-lg bg-white text-black font-semibold">Accept</button>
                  <button onClick={() => act(() => api.respondRequest(r.id, 'reject'))} className="px-3 py-1.5 text-xs rounded-lg border border-white/15">Reject</button>
                </div>
              </div>
            ))}
          </div>
          <h2 className="font-semibold mb-3">Outgoing pending ({sent.length})</h2>
          {sent.length === 0 && <p className="text-sm text-white/40">No outgoing requests.</p>}
          <div className="space-y-3">
            {sent.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <span className="text-sm">@{r.receiver?.username} — pending</span>
                <button onClick={() => act(() => api.cancelRequest(r.id))} className="px-3 py-1.5 text-xs rounded-lg border border-white/15">Cancel</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
