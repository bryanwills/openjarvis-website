export async function copyText(
  text: string,
  nav: { clipboard?: { writeText(t: string): Promise<void> } } = (globalThis as any).navigator ?? {},
  doc: Document | undefined = (globalThis as any).document,
): Promise<boolean> {
  if (nav?.clipboard?.writeText) {
    try {
      await nav.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to the execCommand fallback */
    }
  }

  // Fallback for browsers/contexts where the async clipboard API is
  // unavailable or denied (older Safari, non-HTTPS, permission quirks).
  if (!doc?.body) return false;
  const ta = doc.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  doc.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = doc.execCommand('copy');
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}
