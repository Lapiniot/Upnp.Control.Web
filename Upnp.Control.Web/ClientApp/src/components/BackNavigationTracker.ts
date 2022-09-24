export interface NavigationBackTracker {
    start(): void;
    stop(): void;
}

class HistoryApiTrackerImpl implements NavigationBackTracker {
    private oldState: any;
    private newState: string | undefined;
    private callback: () => void;
    private static key = 0;

    constructor(callback: () => void) {
        this.callback = callback;
    }

    public start() {
        window.addEventListener("popstate", this.popStateListener);
        this.oldState = history.state;
        this.newState = `nav-back-track#${HistoryApiTrackerImpl.key++}`;
        history.pushState(this.newState, "");
    }

    public stop() {
        window.removeEventListener("popstate", this.popStateListener);
        if (history.state?.toString() === this.newState) {
            history.go(-1);
        }
    }

    private popStateListener = (event: PopStateEvent) => {
        if (this.oldState?.toString() === event.state?.toString()) {
            this.callback();
        }
    }
}

class NavigationApiTrackerImpl implements NavigationBackTracker {
    private callback: () => void;
    private prevKey?: string;
    private currentKey?: string;

    constructor(callback: () => void) {
        this.callback = callback;
    }

    async start(): Promise<void> {
        navigation.addEventListener("navigate", this.navigateListener);
        this.prevKey = navigation.currentEntry?.key;
        await navigation.navigate(location.href, { state: null, info: "pushState" }).finished;
        this.currentKey = navigation.currentEntry?.key;
    }

    async stop(): Promise<void> {
        if (navigation.currentEntry?.key === this.currentKey) {
            await navigation.traverseTo(this.prevKey!).finished;
        }

        this.prevKey = this.currentKey = undefined;
        navigation.removeEventListener("navigate", this.navigateListener);
    }

    private navigateListener = (event: NavigateEvent) => {
        const { navigationType, info, canIntercept, userInitiated, destination: { index, sameDocument } } = event;

        if (canIntercept && navigationType === "push" && info === "pushState") {
            event.intercept({ handler: NavigationApiTrackerImpl.handler });
            return;
        }

        if (userInitiated && sameDocument && navigationType === "traverse" && index < navigation.currentEntry?.index!) {
            this.callback();
        }
    }

    private static handler = () => Promise.resolve()
}

export const createBackNavigationTracker = navigation !== undefined
    ? function (callback: () => void): NavigationBackTracker {
        return new NavigationApiTrackerImpl(callback);
    }
    : function (callback: () => void): NavigationBackTracker {
        return new HistoryApiTrackerImpl(callback);
    }