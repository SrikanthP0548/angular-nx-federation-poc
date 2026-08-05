/**
 * Controlled fallback UI: provider load, compatibility and registration
 * failures must produce a recoverable, user-readable error with a trace ID —
 * never a blank page.
 *
 * Plain DOM on purpose: this must work even when Angular itself failed to load.
 */
export function renderShellFailure(host: HTMLElement | null, error: unknown): void {
  const traceId = `shell-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[shell] failure traceId=${traceId}`, message);

  const container = host ?? document.body;
  const fallback = document.createElement('div');
  fallback.setAttribute('role', 'alert');
  fallback.style.cssText =
    'margin:1rem;padding:1rem 1.25rem;border:1px solid #d33;border-radius:6px;' +
    'background:#fdf3f3;color:#611;font-family:system-ui,sans-serif;max-width:40rem;';

  const title = document.createElement('strong');
  title.textContent = 'This page is temporarily unavailable.';
  const detail = document.createElement('p');
  detail.textContent = 'Please try again. If the problem persists, contact support and quote the reference below.';
  const trace = document.createElement('code');
  trace.textContent = `Reference: ${traceId}`;

  fallback.append(title, detail, trace);
  container.replaceChildren(fallback);
}
