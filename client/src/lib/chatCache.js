// Module-level memoization for the chats section.
// First visit loads from API; revisits render instantly from cache while a
// silent background revalidate picks up new followers / conversations.
let convos = null;
let convosAt = 0;
let suggestions = null;
let suggestionsAt = 0;
let requestsCount = null;

const CONVO_TTL = 30_000;
const SUGG_TTL = 5 * 60_000;

export const chatCache = {
  hasConvos: () => convos !== null,
  getConvos: () => convos ?? [],
  setConvos: (rows) => { convos = rows; convosAt = Date.now(); },
  convosFresh: () => convos !== null && Date.now() - convosAt < CONVO_TTL,
  upsertConvoPreview: (id, patch) => {
    if (!convos) return false;
    const i = convos.findIndex((c) => c.id === id);
    if (i === -1) return false;
    const updated = [...convos];
    updated[i] = { ...updated[i], ...patch };
    updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    convos = updated;
    return true;
  },
  hasSuggestions: () => suggestions !== null,
  getSuggestions: () => suggestions ?? [],
  setSuggestions: (rows) => { suggestions = rows; suggestionsAt = Date.now(); },
  suggestionsFresh: () => suggestions !== null && Date.now() - suggestionsAt < SUGG_TTL,
  getRequestsCount: () => requestsCount,
  setRequestsCount: (n) => { requestsCount = n; },
};
