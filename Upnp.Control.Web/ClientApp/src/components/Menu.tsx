import { ButtonHTMLAttributes, HTMLAttributes, PureComponent, ReactNode, createRef } from "react";
import { NavigationBackObserver } from "../services/NavigationBackObserver";
import { PopoverAnchorStrategy, PopupPlacementStrategy } from "../services/PopoverPlacementStrategy";
import { SlideGestureRecognizer, SlideParams } from "../services/gestures/SlideGestureRecognizer";
import { SwipeGestureRecognizer, SwipeGestures } from "../services/gestures/SwipeGestureRecognizer";

const ENABLED_ITEM_SELECTOR = ".dropdown-item:not(:disabled):not(.disabled)";
const FOCUSED_SELECTOR = ":focus";
const TOGGLE_ITEM_SELECTOR = "[data-toggle='dropdown']";

export type MenuProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
    activation?: "explicit",
    onSelected?: (item: HTMLElement, anchor?: HTMLElement) => void,
    render?: (anchor?: HTMLElement | null) => ReactNode
}

type MenuState = {
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

export class Menu extends PureComponent<MenuProps, MenuState> {
    private readonly popoverRef = createRef<HTMLDivElement>();
    private readonly swipeRecognizer: SwipeGestureRecognizer;
    private readonly slideRecognizer: SlideGestureRecognizer;
    private readonly resizeObserver: ResizeObserver;
    private readonly navBackObserver: NavigationBackObserver;
    private readonly strategy: PopupPlacementStrategy;
    state: MenuState = { show: false, anchor: undefined };
    captureY = 0;
    captureHeight = 0;
    intrinsicHeight = 0;

    constructor(props: MenuProps) {
        super(props);
        this.strategy = new PopoverAnchorStrategy("auto");
        this.resizeObserver = new ResizeObserver(this.resizeCallback);
        this.navBackObserver = new NavigationBackObserver(this.navigationBackCallback);
        this.swipeRecognizer = new SwipeGestureRecognizer(this.swipeGestureHandler, 50);
        this.slideRecognizer = new SlideGestureRecognizer(this.slideHandler);
    }

    componentDidMount() {
        const popover = this.popoverRef.current;
        if (popover) {
            if (this.props.activation === undefined) {
                popover.parentElement?.addEventListener("click", this.containerClickListener);
            }
            this.resizeObserver.observe(popover.firstChild as HTMLElement);
            this.popoverRef.current!.addEventListener("toggle", this.popoverToggleListener);
        }
    }

    override async componentDidUpdate(prevProps: MenuProps, prevState: MenuState): Promise<void> {
        const { anchor, show } = this.state;
        const { anchor: prevAnchor } = prevState;
        const popover = this.popoverRef.current!;

        if (this.props.activation !== prevProps.activation) {
            if (this.props.activation === undefined) {
                popover.parentElement?.addEventListener("click", this.containerClickListener);
            } else {
                popover.parentElement?.removeEventListener("click", this.containerClickListener);
            }
        }

        if (anchor !== prevAnchor) {
            if (prevAnchor) prevAnchor.classList.toggle("active", false);
            await this.strategy.update(popover, anchor);
        }

        if (!anchor) return;

        if (show) {
            anchor.classList.toggle("active", true);
            await this.strategy.toggle(true);

            popover.showPopover();

            this.subscribe();
            if (getComputedStyle(popover).getPropertyValue("--bs-action-sheet") === "1") {
                this.slideRecognizer.bind(popover);
                this.swipeRecognizer.bind(popover);
            }

            this.navBackObserver.observe();
        } else {
            this.navBackObserver.disconnect();

            this.swipeRecognizer.unbind();
            this.slideRecognizer.unbind();
            this.unsubscribe();

            popover.hidePopover();

            await Promise.allSettled(this.popoverRef.current!.getAnimations().map(animation => animation.finished));
            await this.strategy.toggle(false);
            popover.style.maxBlockSize = "";
            anchor.classList.toggle("active", false);
        }
    }

    componentWillUnmount() {
        this.popoverRef.current!.removeEventListener("toggle", this.popoverToggleListener);
        this.popoverRef.current!.parentElement!.removeEventListener("click", this.containerClickListener);
        this.unsubscribe();
        this.strategy.destroy();
        this.swipeRecognizer.unbind();
        this.slideRecognizer.unbind();
        this.resizeObserver.disconnect();
        this.navBackObserver.disconnect();
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
        this.popoverRef.current!.addEventListener("pointerdown", this.pointerDownListener);
    }

    private unsubscribe() {
        document.removeEventListener("keydown", this.documentKeydownListener, { capture: true });
        activationEvents.forEach(name => document.removeEventListener(name, this.preventActivationListener, true));
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
        } else if (oldState === "closed" && newState === "open") {
            this.show(document.activeElement as HTMLElement);
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

    private popoverClickHandler = (event: React.MouseEvent<HTMLDivElement>) => {
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

    private resizeCallback = ([{ borderBoxSize: [{ blockSize }] }]: ResizeObserverEntry[]) => {
        if (blockSize === 0) {
            this.intrinsicHeight = 0;
        } else if (this.intrinsicHeight === 0) {
            this.intrinsicHeight = blockSize;
        }
    }

    private swipeGestureHandler = (_: unknown, gesture: SwipeGestures) => {
        if (gesture === "swipe-down") {
            this.hide();
        } else if (gesture === "swipe-up") {
            this.popoverRef.current!.style.maxBlockSize = "100%";
        }
    }

    private slideHandler = (target: HTMLElement, _: "slide", { phase, y }: SlideParams) => {
        switch (phase) {
            case "start":
                if (target !== this.popoverRef.current)
                    return false;
                this.captureY = y;
                this.captureHeight = target.offsetHeight;
                break;
            case "move":
                target.style.maxBlockSize = `min(${Math.round(this.captureHeight - (y - this.captureY))}px, 100%)`;
                break;
            default:
                if (y - this.captureY > this.intrinsicHeight / 2)
                    this.hide();
        }
    }

    private navigationBackCallback = () => {
        if (this.state.show) {
            this.hide();
            // prevent default handling for navigation back
            return false;
        }
    }

    render() {
        const { className, children, render, onSelected, ...other } = this.props;
        const { show, anchor } = this.state;
        return <div popover="" ref={this.popoverRef} inert={show ? undefined : ""}
            className={`dropdown-menu user-select-none fade overflow-y-hidden touch-none${className ? ` ${className}` : ""}`} {...other}
            onClick={this.popoverClickHandler} onBlur={this.focusOutHandler}>
            <ul role="menu" className="touch-auto overflow-y-auto">
                {render ? render(anchor) : children}
            </ul>
        </div>
    }
}
