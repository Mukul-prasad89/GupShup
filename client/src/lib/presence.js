// Module-level online-user store, fed by the server's `presence:update` events.
const online = new Set();
const listeners = new Set();
let attachedTo = null;

function notify() {
  for (const fn of listeners) fn(new Set(online));
}

export function attachPresence(socket) {
  if (!socket || attachedTo === socket) return;
  attachedTo = socket;
  socket.on('presence:update', ({ userId, online: isOnline }) => {
    if (!userId) return;
    if (isOnline) online.add(userId);
    else online.delete(userId);
    notify();
  });
}

export function subscribePresence(fn) {
  listeners.add(fn);
  fn(new Set(online));
  return () => { listeners.delete(fn); };
}
