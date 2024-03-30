export class NavigationBackObserver {
    constructor(private handler: () => void | false) {
    }

    public async observe() {
        if ("navigation" in window) {
            navigation.addEventListener("navigate", this.navigateListener);
            if (!navigation.canGoBack) {
                // Same site back traversal is not possible (we are on the initialy loaded page e.g.)
                // Push extra "dummy" same page navigation entry on stack, so backward navigation becomes possible
                await navigation.navigate(navigation.currentEntry!.url,
                    { history: "push", info: "back-track", state: "back-track" }).committed;
            }
        }
    }

    public async disconnect() {
        if ("navigation" in window) {
            if (navigation.currentEntry?.getState() === "back-track")
                await navigation.back({ info: "back-track" }).committed;
            navigation.removeEventListener("navigate", this.navigateListener);
        }
    }

    public [Symbol.dispose]() {
        this.disconnect();
    }

    public [Symbol.asyncDispose]() {
        return this.disconnect();
    }

    private navigateListener = (event: NavigateEvent) => {
        const { canIntercept, isTrusted, userInitiated, navigationType, cancelable, info, destination: { key } } = event;
        if (canIntercept && info === "back-track") {
            event.intercept({
                handler: () => Promise.resolve(),
                focusReset: "manual",
                scroll: "manual"
            });
        } else if (userInitiated && isTrusted && navigationType === "traverse" &&
            key === navigation.entries().at(-2)?.key) {
            if (this.handler() === false && cancelable)
                event.preventDefault();
        }
    }
}