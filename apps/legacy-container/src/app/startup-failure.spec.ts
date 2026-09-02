import { renderStartupFailure } from './startup-failure';

function freshRoot(): HTMLElement {
  const root = document.createElement('div');
  document.body.appendChild(root);
  return root;
}

describe('renderStartupFailure', () => {
  it('renders a visible, non-empty failure message', () => {
    const root = freshRoot();
    renderStartupFailure(new Error('bootstrap exploded'), root);

    expect(root.textContent).toContain('failed to start');
    expect(root.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('includes a reference id in the rendered message and returns the same id', () => {
    const root = freshRoot();
    const referenceId = renderStartupFailure(new Error('bootstrap exploded'), root);

    expect(referenceId.length).toBeGreaterThan(0);
    expect(root.textContent).toContain(referenceId);
  });

  it('logs the original error to the console tagged with the same reference id', () => {
    const root = freshRoot();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const originalError = new Error('bootstrap exploded');

    const referenceId = renderStartupFailure(originalError, root);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(referenceId), originalError);
    consoleSpy.mockRestore();
  });

  it('replaces whatever was already in the root rather than appending to it', () => {
    const root = freshRoot();
    root.innerHTML = '<app-root>stale content</app-root>';

    renderStartupFailure(new Error('bootstrap exploded'), root);

    expect(root.querySelector('app-root')).toBeNull();
    expect(root.textContent).not.toContain('stale content');
  });

  it('generates a different reference id on each call', () => {
    const first = renderStartupFailure(new Error('a'), freshRoot());
    const second = renderStartupFailure(new Error('b'), freshRoot());
    expect(first).not.toBe(second);
  });
});
