import { useResizeObserver } from "@hooks/ResizeObserver";
import { CssAnchorPositioningStrategy, supported as anchorPositioningSupported } from "@services/CssAnchorPositioningStrategy";
import { EmulateAnchorPositioningStrategy } from "@services/EmulateAnchorPositioningStrategy";
import { SlideGestureRecognizer, type SlideParams } from "@services/gestures/SlideGestureRecognizer";
import { SwipeGestureRecognizer, type SwipeGestures } from "@services/gestures/SwipeGestureRecognizer";
import {
    type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode,
    useCallback, useEffect, useMemo, useRef
} from "react";
import { usePopoverToggleState } from "../hooks/PopoverToggleState";

const ENABLED_ITEM_SELECTOR = ".dropdown-item:not(:disabled):not(.disabled)";
const FOCUSED_SELECTOR = ":focus";
const TOGGLE_ITEM_SELECTOR = "[data-toggle='dropdown']";

export type MenuProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
    activation?: "explicit",
    onSelected?: (item: HTMLElement, anchor?: HTMLElement) => void,
    render?: (anchor?: HTMLElement | null) => ReactNode
}

export function MenuItem({ className, action, icon, children, ...other }: ButtonHTMLAttributes<HTMLButtonElement> & { action?: string, icon?: string }) {
    return <li role="menuitem">
        <button type="button" data-action={action} className={`dropdown-item${className ? ` ${className}` : ""}`} {...other}>
            {icon && <svg><use href={icon} /></svg>}{children}
        </button>
    </li>
}

export function MenuItemSeparator({ className, ...other }: HTMLAttributes<HTMLHRElement>) {
    return <li role="menuitem">
        <hr className={`dropdown-divider${className ? ` ${className}` : ""}`} {...other} />
    </li>
}

const activationEvents: (keyof GlobalEventHandlersEventMap)[] = ["click", "pointerdown", "pointerup"]

export function Menu(props: MenuProps) {
    const { className, children, render, onSelected, activation, ...other } = props;
    const popoverRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const localsRef = useRef({ captureY: 0, captureHeight: 0, intrinsicHeight: 0 });
    const { open, source: anchor } = usePopoverToggleState(popoverRef);
    const strategy = useMemo(() => anchorPositioningSupported
        ? new CssAnchorPositioningStrategy()
        : new EmulateAnchorPositioningStrategy("auto"), []);

    const resizeCallback = useCallback(([{ borderBoxSize: [{ blockSize }] }]: ResizeObserverEntry[]) => {
        const locals = localsRef.current;
        if (blockSize === 0) {
            locals.intrinsicHeight = 0;
        } else if (locals.intrinsicHeight === 0) {
            locals.intrinsicHeight = blockSize;
        }
    }, []);

    const popoverClickHandler = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        const item = (event.target as HTMLElement).closest<HTMLElement>(ENABLED_ITEM_SELECTOR);
        if (item) {
            popoverRef.current?.hidePopover();
            onSelected?.(item, anchor);
        }
    }, [anchor, onSelected]);

    const focusOutHandler = useCallback((event: React.FocusEvent<HTMLElement>) => {
        const popover = popoverRef.current;
        if (popover && !popover.contains(event.relatedTarget as Node)) {
            popover.hidePopover();
            anchor?.focus();
        }
    }, [anchor]);

    useResizeObserver(listRef, resizeCallback);

    useEffect(() => {
        const popover = popoverRef.current;
        if (popover) {
            const parent = popover.parentElement!;
            if (activation === undefined) {
                const clickHandler = (event: PointerEvent) => {
                    if (event.defaultPrevented) {
                        return;
                    }

                    if (!open) {
                        const source = (event.target as HTMLElement).closest<HTMLElement>(TOGGLE_ITEM_SELECTOR) ?? undefined;
                        if (source) {
                            popover.showPopover({ source });
                            event.stopImmediatePropagation();
                        }
                    }
                }

                parent.addEventListener("click", clickHandler);
                return () => {
                    parent.removeEventListener("click", clickHandler);
                }
            }
        }
    }, [activation, open]);

    useEffect(() => {
        const popover = popoverRef.current;
        if (popover) {
            strategy.update(popover, anchor);

            if (open) {
                const documentKeydownListener = (event: KeyboardEvent) => {
                    switch (event.code) {
                        case "ArrowUp":
                            focusPrev(popover);
                            event.preventDefault();
                            break;
                        case "ArrowDown":
                            focusNext(popover);
                            event.preventDefault();
                            break;
                        case "Tab":
                            // Capture focus on the first (last with Shift key) selectable menu item and prevent default handling
                            if (!popover.contains(document.activeElement)) {
                                if (event.shiftKey)
                                    focusPrev(popover);
                                else
                                    focusNext(popover);
                                event.preventDefault();
                            }
                            break;
                        default: return;
                    }

                    event.stopImmediatePropagation();
                }

                const preventActivationListener = (event: Event) => {
                    // Prevent default browser behavior and stop propagation 
                    // if event originited outside of our popover
                    if (!popover.contains(event.target as Node)) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }
                }

                const pointerDownListener = (event: PointerEvent) => {
                    event.stopPropagation();
                }

                document.addEventListener("keydown", documentKeydownListener, { capture: true });
                activationEvents.forEach(name => document.addEventListener(name, preventActivationListener, true));
                popover.addEventListener("pointerdown", pointerDownListener);

                anchor?.classList.toggle("active", true);
                strategy.toggle(true);

                let slideRecognizer: SlideGestureRecognizer | undefined;
                let swipeRecognizer: SwipeGestureRecognizer | undefined;

                if (getComputedStyle(popover).getPropertyValue("--bs-action-sheet") === "1") {
                    slideRecognizer = new SlideGestureRecognizer((target: HTMLElement, _: "slide", { phase, y }: SlideParams) => {
                        const locals = localsRef.current;
                        switch (phase) {
                            case "start":
                                if (target !== popover)
                                    return false;
                                locals.captureY = y;
                                locals.captureHeight = target.offsetHeight;
                                break;
                            case "move":
                                target.style.maxBlockSize = `min(${Math.round(locals.captureHeight - (y - locals.captureY))}px, 100%)`;
                                break;
                            default:
                                if (y - locals.captureY > locals.intrinsicHeight / 2)
                                    popover.hidePopover();
                        }
                    });

                    swipeRecognizer = new SwipeGestureRecognizer((_: unknown, gesture: SwipeGestures) => {
                        if (gesture === "swipe-down") {
                            popover.hidePopover();
                        } else if (gesture === "swipe-up") {
                            popover.style.maxBlockSize = "100%";
                        }
                    }, 50);

                    slideRecognizer.bind(popover);
                    swipeRecognizer.bind(popover);
                }

                return () => {
                    swipeRecognizer?.unbind();
                    slideRecognizer?.unbind();

                    document.removeEventListener("keydown", documentKeydownListener, { capture: true });
                    activationEvents.forEach(name => document.removeEventListener(name, preventActivationListener, true));
                    popover.removeEventListener("pointerdown", pointerDownListener);

                    Promise.allSettled(popover.getAnimations().map(animation => animation.finished))
                        .then(() => {
                            strategy.toggle(false);
                            popover.style.maxBlockSize = "";
                            anchor?.classList.toggle("active", false)
                        });
                }
            }
        }
    }, [open, anchor, strategy]);

    return <div popover="" ref={popoverRef} inert={!open}
        className={`dropdown-menu user-select-none fade touch-none${className ? ` ${className}` : ""}`} {...other}
        onClick={popoverClickHandler} onBlur={focusOutHandler}>
        <ul ref={listRef} role="menu" className="touch-auto">
            {render ? render(anchor) : children}
        </ul>
    </div>
}

function getMenuItems(popover: HTMLDivElement) {
    return popover.querySelectorAll<HTMLElement>(ENABLED_ITEM_SELECTOR);
}

function focusNext(popover: HTMLDivElement) {
    const items = getMenuItems(popover);
    if (!items?.length)
        return false;

    for (let index = 0; index < items.length; index++) {
        const element = items[index];
        if (element.matches(FOCUSED_SELECTOR)) {
            if (index < items.length - 1) {
                items[index + 1].focus();
            }

            return;
        }
    }

    items[0].focus();
}

function focusPrev(popover: HTMLDivElement) {
    const items = getMenuItems(popover);
    if (!items?.length)
        return false;

    for (let index = 0; index < items.length; index++) {
        const element = items[index];
        if (element.matches(FOCUSED_SELECTOR)) {
            if (index > 0) {
                items[index - 1].focus();
            }

            return;
        }
    }

    items[items.length - 1].focus();
}