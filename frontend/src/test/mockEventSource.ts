/** Test double for the native EventSource — jsdom doesn't implement it, and the
 * live-data hooks (useLiveEvents) build entirely on addEventListener/close. */
export class MockEventSource {
  static instances: MockEventSource[] = [];

  listeners: Record<string, Array<(event: MessageEvent) => void>> = {};
  closed = false;

  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    (this.listeners[type] ??= []).push(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((candidate) => candidate !== listener);
  }

  close() {
    this.closed = true;
  }

  /** Simulates the backend pushing a named SSE event with a JSON payload. */
  emit(type: string, data: unknown) {
    const event = new MessageEvent(type, { data: JSON.stringify(data) });
    for (const listener of this.listeners[type] ?? []) listener(event);
  }
}

/** Installs the mock as `globalThis.EventSource` and returns a restore function. */
export function installMockEventSource() {
  MockEventSource.instances = [];
  const original = globalThis.EventSource;
  globalThis.EventSource = MockEventSource as unknown as typeof EventSource;
  return () => {
    globalThis.EventSource = original;
  };
}
