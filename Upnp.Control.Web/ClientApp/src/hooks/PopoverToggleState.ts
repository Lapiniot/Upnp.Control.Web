import { type RefObject, useMemo, useSyncExternalStore } from "react";

type ToggleState = {
    open: boolean;
    source: HTMLElement | undefined;
}

class PopoverToggleStateStore implements ExternalStore<ToggleState> {
    private snapshot: ToggleState;

    constructor(private popoverRef: RefObject<HTMLElement | null>) {
        this.snapshot = { open: false, source: undefined };
    }

    getSnapshot = () => {
        return this.snapshot;
    }

    subscribe = (onStoreChange: () => void) => {
        const popover = this.popoverRef.current;
        if (popover) {
            const beforeToggleListener = ({ oldState, newState, source }: ToggleEvent) => {
                if (oldState === "closed" && newState === "open") {
                    this.snapshot = { open: true, source: source as HTMLElement };
                    onStoreChange();
                }
            }

            const toggleListener = ({ oldState, newState }: ToggleEvent) => {
                if (oldState === "open" && newState === "closed") {
                    Promise.allSettled(popover.getAnimations().map(a => a.finished)).then(() => {
                        this.snapshot = { open: false, source: undefined };
                        onStoreChange();
                    });
                }
            }

            popover.addEventListener("toggle", toggleListener);
            popover.addEventListener("beforetoggle", beforeToggleListener);

            return () => {
                popover.removeEventListener("toggle", toggleListener);
                popover.removeEventListener("beforetoggle", beforeToggleListener);
            };
        }

        return () => { };
    }
}

export function usePopoverToggleState(popoverRef: RefObject<HTMLElement | null>): ToggleState {
    const store = useMemo(() => new PopoverToggleStateStore(popoverRef), [popoverRef]);
    return useSyncExternalStore(store.subscribe, store.getSnapshot);
}