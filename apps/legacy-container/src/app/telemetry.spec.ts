import { emitTelemetry } from './telemetry';

describe('emitTelemetry', () => {
  it('logs to the console with the event name and data', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    emitTelemetry('some.event', { foo: 'bar' });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('some.event'), { foo: 'bar' });
    consoleSpy.mockRestore();
  });

  it('dispatches a legacy-container-telemetry CustomEvent carrying the same name and data', () => {
    let received: CustomEvent | undefined;
    const listener = (event: Event) => {
      received = event as CustomEvent;
    };
    window.addEventListener('legacy-container-telemetry', listener);

    emitTelemetry('some.event', { foo: 'bar' });

    window.removeEventListener('legacy-container-telemetry', listener);
    expect(received?.detail).toEqual({ name: 'some.event', data: { foo: 'bar' } });
  });

  it('works without a data payload', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => emitTelemetry('some.event')).not.toThrow();
    consoleSpy.mockRestore();
  });
});
