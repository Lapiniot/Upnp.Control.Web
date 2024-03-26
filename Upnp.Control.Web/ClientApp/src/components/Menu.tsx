import { ButtonHTMLAttributes, HTMLAttributes, PureComponent, ReactNode, createRef } from "react";
import { PopoverAnchorStrategy, PopupPlacementStrategy } from "../services/PopoverPlacementStrategy";
import { SwipeGestureRecognizer, SwipeGestures } from "../services/gestures/SwipeGestureRecognizer";

const ENABLED_ITEM_SELECTOR = ".dropdown-item:not(:disabled):not(.disabled)";
const FOCUSED_SELECTOR = ":focus";
const TOGGLE_ITEM_SELECTOR = "[data-toggle='dropdown']";

export type DropdownMenuProps = Omit<HTMLAttributes<HTMLUListElement>, "onSelect"> & {
    onSelected?: (item: HTMLElement, anchor?: HTMLElement) => void,
    render?: (anchor?: HTMLElement | null) => ReactNode
}

type DropdownMenuState = {
    anchor?: HTMLElement,
    show: boolean
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

export class Menu extends PureComponent<DropdownMenuProps, DropdownMenuState> {
    private readonly popoverRef = createRef<HTMLUListElement>();
    private readonly swipeRecognizer: SwipeGestureRecognizer;
    private readonly observer: ResizeObserver;
    private strategy: PopupPlacementStrategy;
    state: DropdownMenuState = { show: false, anchor: undefined };

    constructor(props: DropdownMenuProps) {
        super(props);
        this.strategy = new PopoverAnchorStrategy("auto");
        this.swipeRecognizer = new SwipeGestureRecognizer(this.swipeGestureHandler);
        this.observer = new ResizeObserver(this.resizeCallback);
    }

    componentDidMount() {
        const popover = this.popoverRef.current;
        if (popover) {
            popover.parentElement?.addEventListener("click", this.containerClickListener);
            this.observer.observe(popover);
        }
    }

    override async componentDidUpdate(): Promise<void> {
        const popover = this.popoverRef.current!;
        const { anchor, show } = this.state;

        if (!anchor) {
            this.strategy.destroy();
            return;
        } else {
            await this.strategy.update(popover, anchor);
        }

        if (show) {
            anchor.dataset["anchorActive"] = "";
            await this.strategy.toggle(true);
            popover.showPopover();
            this.subscribe();
        } else {
            this.unsubscribe();
            popover.hidePopover();
            await Promise.allSettled(this.popoverRef.current!.getAnimations().map(animation => animation.finished));
            await this.strategy.toggle(false);
            delete anchor.dataset["anchorActive"];
        }
    }

    componentWillUnmount() {
        this.popoverRef.current!.parentElement!.removeEventListener("click", this.containerClickListener);
        this.unsubscribe();
        this.strategy.destroy();
        this.swipeRecognizer.unbind();
        this.observer.disconnect();
    }

    public show(anchor: HTMLElement) {
        this.setState({ show: true, anchor });
    }

    public hide() {
        this.setState({ show: false });
    }

    private queryAll(selector: string) {
        return this.popoverRef.current!.querySelectorAll<HTMLElement>(selector);
    }

    private subscribe() {
        document.addEventListener("keydown", this.documentKeydownListener, { capture: true });
        activationEvents.forEach(name => document.addEventListener(name, this.preventActivationListener, true));
        this.popoverRef.current!.addEventListener("toggle", this.popoverToggleListener);
        this.popoverRef.current!.addEventListener("pointerdown", this.pointerDownListener);
    }

    private unsubscribe() {
        document.removeEventListener("keydown", this.documentKeydownListener, { capture: true });
        activationEvents.forEach(name => document.removeEventListener(name, this.preventActivationListener, true));
        this.popoverRef.current!.removeEventListener("toggle", this.popoverToggleListener);
        this.popoverRef.current!.removeEventListener("pointerdown", this.pointerDownListener);
    }

    //#region Focus helpers

    private focusNext() {
        const items = this.queryAll(ENABLED_ITEM_SELECTOR);

        if (!items?.length) return false;

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

    private focusPrev() {
        const items = this.queryAll(ENABLED_ITEM_SELECTOR);

        if (!items?.length) return false;

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

    //#endregion

    private containerClickListener = (event: MouseEvent) => {
        if (event.defaultPrevented) return;
        const item = (event.target as HTMLElement).closest<HTMLElement>(TOGGLE_ITEM_SELECTOR);
        if (item && !this.state.show) {
            this.show(item);
            event.stopImmediatePropagation();
        }
    }

    private popoverToggleListener = (e: Event) => {
        const { oldState, newState } = e as ToggleEvent;
        if (oldState === "open" && newState === "closed") {
            this.hide();
        }
    }

    private documentKeydownListener = (event: KeyboardEvent) => {
        switch (event.code) {
            case "ArrowUp":
                this.focusPrev();
                break;
            case "ArrowDown":
                this.focusNext();
                break;
            case "Tab":
                // Capture focus on the first (last with Shift key) selectable menu item and prevent default handling
                if (!this.popoverRef.current?.contains(document.activeElement)) {
                    if (event.shiftKey)
                        this.focusPrev();
                    else
                        this.focusNext();
                    event.preventDefault();
                }
                break;
            default: return;
        }

        event.stopImmediatePropagation();
    }

    private preventActivationListener = (event: Event) => {
        // Prevent default browser behavior and stop propagation if event originited outside of our popover
        if (!this.popoverRef.current!.contains((event.target as Node))) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    private pointerDownListener = (event: PointerEvent) => {
        event.stopPropagation();
    }

    private popoverClickHandler = (event: React.MouseEvent<HTMLUListElement>) => {
        const item = (event.target as HTMLElement).closest<HTMLElement>(ENABLED_ITEM_SELECTOR);
        if (item) {
            this.hide();
            this.props.onSelected?.(item, this.state.anchor);
        }
    }

    private focusOutHandler = (event: React.FocusEvent<HTMLElement>) => {
        if (!this.popoverRef.current?.contains(event.relatedTarget as Node)) {
            this.hide();
            this.state.anchor?.focus();
        }
    }

    private resizeCallback = (entries: ResizeObserverEntry[]) => {
        const [{ target: { scrollHeight, clientHeight } }] = entries;
        if (scrollHeight > clientHeight || clientHeight === 0) {
            // Popup element has content overflow (or simply hidden), so stop swipe-down gesture tracking and 
            // prefere browser native behavior(content scrolling).
            this.swipeRecognizer.unbind();
            this.popoverRef.current!.classList.toggle("touch-none", false);
        } else {
            this.popoverRef.current!.classList.toggle("touch-none", true);
            this.swipeRecognizer.bind(this.popoverRef.current!);
        }
    }

    private swipeGestureHandler = (_: unknown, gesture: SwipeGestures) => {
        if (gesture === "swipe-down") {
            this.hide();
        }
    }

    render() {
        const { className, children, render, onSelected, ...other } = this.props;
        const { show, anchor } = this.state;
        return <ul popover="" role="menu" ref={this.popoverRef} inert={show ? undefined : ""}
            className={`dropdown-menu user-select-none fade${className ? ` ${className}` : ""}`} {...other}
            onClick={this.popoverClickHandler} onBlur={this.focusOutHandler}>
            {render ? render(anchor) : children}
        </ul>
    }
}
