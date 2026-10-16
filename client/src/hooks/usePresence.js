import { useSyncExternalStore } from 'react';
import { subscribePresence } from '../lib/presence.js';

let snapshot = new Set();

// Stable module-level subscribe — a new closure per render would make React
// unsubscribe/resubscribe every render and loop forever.
function subscribe(notify) {
  return subscribePresence((s) => {
    snapshot = s;
    notify();
  });
}

function getSnapshot() {
  return snapshot;
}

export function usePresence() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
