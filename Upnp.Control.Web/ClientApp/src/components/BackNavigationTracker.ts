export interface NavigationBackTracker {
    start(): Promise<void>;
    stop(): Promise<void>;
}

abstract class TrackerBase implements NavigationBackTracker {
    protected readonly callback: () => void;
    private active: boolean = false;

    constructor(callback: () => void) {
        this.callback = callback;
    }

    public async start() {
        if (this.tryEnter()) {
            await this.pushState();
        }
    }

    public async stop() {
        if (this.tryExit()) {
            await this.popState();
        }
    }

    protected tryEnter(): boolean {
        if (!this.active) return this.active = true;
        return false;
    }

    protected tryExit(): boolean {
        if (this.active) return !(this.active = false);
        return false;
    }

    protected abstract pushState(): void;
    protected abstract popState(): void;
}

class HistoryApiTrackerImpl extends TrackerBase {
    private oldState: any;
    private newState: string | undefined;
    private static key = 0;

    protected override pushState() {
        window.addEventListener("popstate", this.popStateListener);
        this.oldState = history.state;
        this.newState = `nav-back-track#${HistoryApiTrackerImpl.key++}`;
        history.pushState(this.newState, "");
    }

    protected override popState() {
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

class NavigationApiTrackerImpl extends TrackerBase {
    private prevKey?: string;
    private currentKey?: string;

    protected override async pushState(): Promise<void> {
        navigation.addEventListener("navigate", this.navigateListener);
        this.prevKey = navigation.currentEntry?.key;
        await navigation.navigate(location.href, { info: "pushState", history: "push" }).finished;
        this.currentKey = navigation.currentEntry?.key;
    }

    protected override async popState(): Promise<void> {
        navigation.removeEventListener("navigate", this.navigateListener);

        if (navigation.currentEntry?.key === this.currentKey) {
            await navigation.traverseTo(this.prevKey!).finished;
        }

        this.prevKey = this.currentKey = undefined;
    }

    private navigateListener = (event: NavigateEvent) => {
        const { navigationType, info, canIntercept, userInitiated, destination: { index, sameDocument } } = event;

        if (canIntercept && navigationType === "push" && info === "pushState") {
            event.intercept({ handler: NavigationApiTrackerImpl.handler, focusReset: "manual", scroll: "manual" });
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