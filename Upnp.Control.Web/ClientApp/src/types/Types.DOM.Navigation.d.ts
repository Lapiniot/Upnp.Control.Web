declare global {
    type NavigationType = "reload" | "push" | "replace" | "traverse";

    interface NavigationDestination {
        readonly url: string;
        readonly key?: string;
        readonly id?: string;
        readonly index: number;
        readonly sameDocument: boolean;

        getState(): unknown;
    }

    interface NavigationTransition {
        readonly navigationType: NavigationType;
        readonly from: NavigationHistoryEntry;
        readonly finished: Promise<undefined>;
    }

    interface NavigationActivation {
        readonly from?: NavigationHistoryEntry;
        readonly entry: NavigationHistoryEntry;
        readonly navigationType: NavigationType;
    }

    type NavigationInterceptHandler = () => Promise<void>;

    type NavigationFocusReset = "after-transition" | "manual";

    type NavigationScrollBehavior = "after-transition" | "manual";

    interface NavigationInterceptOptions {
        handler?: NavigationInterceptHandler;
        focusReset?: NavigationFocusReset;
        scroll?: NavigationScrollBehavior;
    }

    interface NavigateEvent extends Event {
        readonly navigationType: NavigationType;
        readonly destination: NavigationDestination;
        readonly canIntercept: boolean;
        readonly userInitiated: boolean;
        readonly hashChange: boolean;
        readonly signal: AbortSignal;
        readonly formData?: FormData;
        readonly downloadRequest?: string;
        readonly info?: unknown;

        intercept(options?: NavigationInterceptOptions): void;
        scroll(): void;
    }

    interface NavigationCurrentEntryChangeEvent extends Event {
        from: NavigationHistoryEntry;
        navigationType: NavigationType;
    }

    interface NavigationEventMap {
        "currententrychange": NavigationCurrentEntryChangeEvent;
        "navigate": NavigateEvent;
        "navigatesuccess": Event;
        "navigateerror": ErrorEvent;
    }

    interface NavigationHistoryEntryEventMap {
        "dispose": Event;
    }

    interface NavigationHistoryEntry extends EventTarget {
        readonly url: string;
        readonly key: string;
        readonly id: string;
        readonly index: number;
        readonly sameDocument: boolean;

        getState(): unknown;

        addEventListener<K extends keyof NavigationHistoryEntryEventMap>(type: K, listener: (this: NavigationHistoryEntry, ev: NavigationHistoryEntryEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof NavigationHistoryEntryEventMap>(type: K, listener: (this: NavigationHistoryEntry, ev: NavigationHistoryEntryEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    }

    interface NavigationUpdateCurrentEntryOptions extends Record<string, unknown> {
        state?: unknown
    }

    type NavigationHistoryBehavior = "auto" | "push" | "replace";

    interface NavigationOptions extends Record<string, unknown> {
        info?: unknown
    }

    interface NavigationNavigateOptions extends NavigationOptions {
        state?: unknown;
        history?: NavigationHistoryBehavior
    }

    interface NavigationResult extends Record<string, unknown> {
        committed: Promise<NavigationHistoryEntry>;
        finished: Promise<NavigationHistoryEntry>;
    }

    interface NavigationReloadOptions extends NavigationOptions {
        state?: unknown
    }

    interface Navigation extends EventTarget<NavigationEventMap> {
        entries(): ReadonlyArray<NavigationHistoryEntry>;
        readonly currentEntry?: NavigationHistoryEntry;
        updateCurrentEntry(options: NavigationUpdateCurrentEntryOptions): void;
        readonly transition?: NavigationTransition;
        readonly activation?: NavigationActivation;

        readonly canGoBack: boolean;
        readonly canGoForward: boolean;

        navigate(url: string, options?: NavigationNavigateOptions = {}): NavigationResult;
        reload(options?: NavigationReloadOptions = {}): NavigationResult;

        traverseTo(key: string, options?: NavigationOptions = {}): NavigationResult;
        back(options?: NavigationOptions = {}): NavigationResult;
        forward(options?: NavigationOptions = {}): NavigationResult;

        onnavigate: ((this: Navigation, event: NavigateEvent) => unknown) | null;
        onnavigatesuccess: ((this: Navigation, event: Event) => unknown) | null;
        onnavigateerror: ((this: Navigation, event: ErrorEvent) => unknown) | null;
        oncurrententrychange: ((this: Navigation, event: NavigationCurrentEntryChangeEvent) => unknown) | null;

        addEventListener<K extends keyof NavigationEventMap>(type: K, listener: (this: Navigation, event: NavigationEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof NavigationEventMap>(type: K, listener: (this: Navigation, event: NavigationEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    }

    interface Window {
        readonly navigation: Navigation;
    }

    declare var navigation: Navigation;
}

export { }