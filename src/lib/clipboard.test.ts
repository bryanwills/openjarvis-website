import { describe, it, expect, vi } from 'vitest';
import { copyText } from './clipboard';

function fakeDoc(execResult: boolean | (() => boolean)) {
  const ta = {
    value: '',
    setAttribute: vi.fn(),
    style: {} as Record<string, string>,
    select: vi.fn(),
    remove: vi.fn(),
  };
  const doc = {
    body: { appendChild: vi.fn() },
    createElement: vi.fn().mockReturnValue(ta),
    execCommand: vi.fn().mockImplementation(
      typeof execResult === 'function' ? execResult : () => execResult,
    ),
  } as unknown as Document;
  return { doc, ta };
}

describe('copyText', () => {
  it('writes text via the clipboard API and returns true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const ok = await copyText('hello', { clipboard: { writeText } });
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(ok).toBe(true);
  });

  it('returns false when no clipboard API and no document are present', async () => {
    expect(await copyText('x', {}, undefined)).toBe(false);
  });

  it('falls back to execCommand when the clipboard API is missing', async () => {
    const { doc, ta } = fakeDoc(true);
    const ok = await copyText('fallback', {}, doc);
    expect(ok).toBe(true);
    expect(ta.value).toBe('fallback');
    expect(ta.remove).toHaveBeenCalled();
  });

  it('falls back to execCommand when the clipboard API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const { doc } = fakeDoc(true);
    expect(await copyText('x', { clipboard: { writeText } }, doc)).toBe(true);
  });

  it('returns false when execCommand also fails', async () => {
    const { doc } = fakeDoc(() => {
      throw new Error('nope');
    });
    expect(await copyText('x', {}, doc)).toBe(false);
  });
});
