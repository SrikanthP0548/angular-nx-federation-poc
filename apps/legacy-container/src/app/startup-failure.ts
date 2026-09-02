/**
 * Renders a minimal, dependency-free failure message directly into the DOM
 * when Angular itself fails to bootstrap.
 *
 * Angular's own error handling and component rendering aren't available at
 * this point — the framework never started — so this must not depend on
 * Angular, DomSanitizer, or any component; it's plain DOM APIs only.
 *
 * A console.error alone (the previous behavior) leaves the tab looking
 * blank or stuck loading forever, with nothing for the person looking at it
 * to act on or report. The reference id lets "it's stuck" be tied back to
 * the console entry carrying the real error/stack, without putting error
 * internals in front of whoever is looking at the page.
 */
export function renderStartupFailure(error: unknown, root: ParentNode = document.body): string {
  const referenceId = generateReferenceId();
  console.error(`[legacy-container] startup failed — reference ${referenceId}`, error);

  const container = document.createElement('div');
  container.setAttribute('role', 'alert');
  container.setAttribute('data-startup-failure', referenceId);
  container.style.cssText =
    'font: 14px/1.5 system-ui, sans-serif; padding: 2rem; max-width: 32rem; margin: 3rem auto; color: #7a1a1a;';
  container.innerHTML = `
    <p style="margin: 0 0 0.5rem; font-weight: 600;">This application failed to start.</p>
    <p style="margin: 0;">Reloading the page may fix this. If it keeps happening, report reference <code>${referenceId}</code>.</p>
  `;

  root.replaceChildren(container);
  return referenceId;
}

/** Short enough to read aloud or paste into a support message; not a security token. */
function generateReferenceId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}
