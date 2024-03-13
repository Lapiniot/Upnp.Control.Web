declare global {
    interface CloseWatcher extends EventTarget {
        requestClose(): void;
        close(): void;
        destroy(): void;

        oncancel: ((this: CloseWatcher, event: Event) => unknown) | null;
        onclose: ((this: CloseWatcher, event: Event) => unknown) | null;

        addEventListener<K extends keyof CloseWatcherEventMap>(type: K, listener: (this: CloseWatcher, event: CloseWatcherEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof CloseWatcherEventMap>(type: K, listener: (this: CloseWatcher, event: CloseWatcherEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    }

    interface CloseWatcherEventMap {
        "close": Event;
        "cancel": Event;
    }

    interface CloseWatcherOptions {
        signal: AbortSignal
    }

    declare var CloseWatcher: {
        prototype: CloseWatcher;
        new(options: CloseWatcherOptions = {}): CloseWatcher;
    }
}

export { }