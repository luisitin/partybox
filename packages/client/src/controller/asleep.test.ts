// I-387: after 20 s without the server, the phone names the PC.
import { describe, expect, it } from 'vitest';
import { ASLEEP_AFTER_MS, asleepLine } from './flapFree';

describe('I-387: asleepLine', () => {
  it('stays quiet for a normal reconnect', () => {
    expect(asleepLine(ASLEEP_AFTER_MS - 1, true, '9:41 PM', '192.168.4.87:42069')).toBeNull();
  });
  it('names the PC, the time and the address after 20 s', () => {
    const line = asleepLine(ASLEEP_AFTER_MS, true, '9:41 PM', '192.168.4.87:42069');
    expect(line).toContain('9:41 PM');
    expect(line).toContain('192.168.4.87:42069');
    expect(line).toMatch(/asleep/);
  });
  it("doesn't blame the PC when this phone is the one offline", () => {
    expect(asleepLine(60_000, false, '9:41 PM', 'x')).toBeNull();
  });
});
