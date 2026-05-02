import { describe, expect, it } from 'vitest';
import {
  createAdminSessionValue,
  verifyAdminSessionValue,
} from './adminSession';

describe('adminSession', () => {
  it('round-trips a signed session', () => {
    const secret = 'test-secret-at-least-thirty-two-bytes-long!!';
    const raw = createAdminSessionValue(secret);
    expect(verifyAdminSessionValue(raw, secret)).toBe(true);
    expect(verifyAdminSessionValue(raw, 'wrong-secret')).toBe(false);
    expect(verifyAdminSessionValue(undefined, secret)).toBe(false);
    expect(verifyAdminSessionValue('not.valid', secret)).toBe(false);
  });
});
