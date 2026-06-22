export async function copyText(
  text: string,
  nav: { clipboard?: { writeText(t: string): Promise<void> } } = (globalThis as any).navigator ?? {},
): Promise<boolean> {
  if (!nav?.clipboard?.writeText) return false;
  try { await nav.clipboard.writeText(text); return true; } catch { return false; }
}
