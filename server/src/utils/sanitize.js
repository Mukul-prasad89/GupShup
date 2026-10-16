export function publicUser(u) {
  if (!u) return null;
  const { passwordHash: _omit, ...rest } = u;
  return rest;
}
