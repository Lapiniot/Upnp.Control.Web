declare global {
    type NavigationType = "reload" | "push" | "replace" | "traverse";

    interface NavigationDestination {
        readonly url: string;
        readonly key?: string;
        readonly id?: string;
        readonly index: number;
        readonly sameDocument: boolean;

        getState(): any;
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
        readonly info?: any;

        intercept(options?: NavigationInterceptOptions): void;
        scroll(): void;
    }

    interface NavigationEventMap {
        "navigate": NavigateEvent;
        "navigatesuccess": NavigateEvent;
        "navigateerror": NavigateEvent;
        "currententrychange": NavigateEvent;
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

        getState(): any;

        addEventListener<K extends keyof NavigationHistoryEntryEventMap>(type: K, listener: (this: NavigationHistoryEntry, ev: NavigationHistoryEntryEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof NavigationHistoryEntryEventMap>(type: K, listener: (this: NavigationHistoryEntry, ev: NavigationHistoryEntryEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    }

    interface NavigationUpdateCurrentEntryOptions extends Record<string, any> {
        state?: any
    }

    type NavigationHistoryBehavior = "auto" | "push" | "replace";

    interface NavigationOptions extends Record<string, any> {
        info?: any
    }

    interface NavigationNavigateOptions extends NavigationOptions {
        state?: any;
        history?: NavigationHistoryBehavior
    }

    interface NavigationResult extends Record<string, any> {
        committed: Promise<NavigationHistoryEntry>;
        finished: Promise<NavigationHistoryEntry>;
    }

    interface NavigationReloadOptions extends NavigationOptions {
        state?: any
    }

    interface Navigation extends EventTarget {
        entries(): ReadonlyArray<NavigationHistoryEntry>;
        readonly currentEntry?: NavigationHistoryEntry;
        updateCurrentEntry(options: NavigationUpdateCurrentEntryOptions): void;
        readonly transition?: NavigationTransition;

        readonly canGoBack: boolean;
        readonly canGoForward: boolean;

        navigate(url: string, options?: NavigationNavigateOptions = {}): NavigationResult;
        reload(options?: NavigationReloadOptions = {}): NavigationResult;

        traverseTo(key: string, options?: NavigationOptions = {}): NavigationResult;
        back(options?: NavigationOptions = {}): NavigationResult;
        forward(options?: NavigationOptions = {}): NavigationResult;

        onnavigate: EventHandler | null;
        onnavigatesuccess: EventHandler | null;
        onnavigateerror: EventHandler | null;
        oncurrententrychange: EventHandler | null;

        addEventListener<K extends keyof NavigationEventMap>(type: K, listener: (this: Navigation, ev: NavigationEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof NavigationEventMap>(type: K, listener: (this: Navigation, ev: NavigationEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    }

    interface Window {
        readonly navigation: Navigation;
    }

    var navigation: Navigation;
}

export { }
