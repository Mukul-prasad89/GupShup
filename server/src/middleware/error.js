// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? 500;
  const message = status >= 500 ? 'Internal server error' : err.message ?? 'Request failed';
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
}

export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}
