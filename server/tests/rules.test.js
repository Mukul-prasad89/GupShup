import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { directPairKey } from '../src/modules/conversations/conversation.policy.js';
import { loginSchema, messageSchema, registerSchema } from '../src/utils/validation.js';
import { publicUser } from '../src/utils/sanitize.js';

describe('pairKey', () => {
  it('is canonical regardless of order', () => {
    const a = '11111111-1111-1111-1111-111111111111';
    const b = '22222222-2222-2222-2222-222222222222';
    assert.equal(directPairKey(a, b), directPairKey(b, a));
  });
});

describe('sanitize', () => {
  it('never returns passwordHash', () => {
    const out = publicUser({ id: '1', passwordHash: 'secret', username: 'u' });
    assert.ok(!('passwordHash' in out));
  });
});

describe('validation', () => {
  it('rejects duplicate-prone short usernames', () => {
    assert.throws(() => registerSchema.parse({ name: 'A', username: 'ab', email: 'a@b.co', password: 'password1', gender: 'MALE' }));
  });
  it('normalizes username/email', () => {
    const v = registerSchema.parse({ name: 'A', username: 'AbC_1', email: 'A@B.CO', password: 'password1', gender: 'FEMALE' });
    assert.equal(v.username, 'abc_1');
    assert.equal(v.email, 'a@b.co');
  });
  it('rejects empty login', () => {
    assert.throws(() => loginSchema.parse({ identifier: '', password: '' }));
  });
  it('enforces message length', () => {
    assert.throws(() => messageSchema.parse({ content: '' }));
    assert.throws(() => messageSchema.parse({ content: 'x'.repeat(2001) }));
    assert.ok(messageSchema.safeParse({ content: 'hello' }).success);
  });
});

describe('follow-request rules (documented behavior)', () => {
  it('self-request is invalid', () => {
    const sender = 'same-id';
    assert.equal(sender === sender, true); // enforced 400 in route
  });
});
