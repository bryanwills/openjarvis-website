import { describe, it, expect, vi } from 'vitest';
import { copyText } from './clipboard';

describe('copyText', () => {
  it('writes text via the clipboard API and returns true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const ok = await copyText('hello', { clipboard: { writeText } });
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(ok).toBe(true);
  });
  it('returns false when no clipboard API is present', async () => {
    expect(await copyText('x', {})).toBe(false);
  });
});
