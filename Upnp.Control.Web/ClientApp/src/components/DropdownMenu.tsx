import { ButtonHTMLAttributes, FocusEvent, HTMLAttributes, PureComponent, MouseEvent as ReactMouseEvent, ReactNode, createRef } from "react";
import { MediaQueries } from "../services/MediaQueries";
import { PopoverAnchorStrategy, FixedStrategy, Placement, PopupPlacementStrategy } from "../services/PopupPlacementStrategy";
import { SwipeGestureRecognizer, SwipeGestures } from "../services/gestures/SwipeGestureRecognizer";

const ENABLED_ITEM_SELECTOR = ".dropdown-item:not(:disabled):not(.disabled)";
const FOCUSED_SELECTOR = ":focus";
const TOGGLE_ITEM_SELECTOR = "[data-toggle='dropdown']";

type DropdownMode = "menu" | "action-sheet" | "auto";

export type DropdownMenuProps = Omit<HTMLAttributes<HTMLUListElement>, "onSelect"> & {
    mode: DropdownMode,
    placement: Placement,
    onSelected?: (item: HTMLElement, anchor?: HTMLElement) => void,
    render?: (anchor?: HTMLElement | null) => ReactNode
}

type DropdownMenuState = {
    anchor?: HTMLElement,
    show: boolean
}

export function MenuItem({ className, action, glyph, children, ...other }: ButtonHTMLAttributes<HTMLButtonElement> & { action?: string, glyph?: string }) {
    return <li>
        <button type="button" data-action={action} className={`dropdown-item${className ? ` ${className}` : ""}`} {...other}>
            {glyph && <svg><use href={glyph} /></svg>}{children}
        </button>
    </li>
}

const activationEvents: (keyof GlobalEventHandlersEventMap)[] = ["click", "pointerdown", "pointerup"]

export class DropdownMenu extends PureComponent<DropdownMenuProps, DropdownMenuState> {
    private readonly popoverRef = createRef<HTMLUListElement>();
    private readonly swipeRecognizer: SwipeGestureRecognizer;
    private readonly observer: ResizeObserver;
    private strategy: PopupPlacementStrategy;
    state: DropdownMenuState = { show: false, anchor: undefined };
    static defaultProps: Partial<DropdownMenuProps> = {
        mode: "auto",
        placement: "auto"
    }

    constructor(props: DropdownMenuProps) {
        super(props);
        this.strategy = this.createPlacementStrategy(props.placement);
        this.swipeRecognizer = new SwipeGestureRecognizer(this.swipeGestureHandler);
        this.observer = new ResizeObserver(this.resizeCallback);
    }

    componentDidMount() {
        this.popoverRef.current?.parentElement?.addEventListener("click", this.containerClickListener);
        MediaQueries.smallScreen.addEventListener("change", this.mediaQueryChangeListener);
        this.observer.observe(this.popoverRef.current!);
    }

    override async componentDidUpdate({ mode: prevMode }: Readonly<DropdownMenuProps>): Promise<void> {
        const popover = this.popoverRef.current!;
        const { anchor, show } = this.state;
        const { placement, mode } = this.props;

        if (mode !== prevMode) {
            this.strategy.destroy();
            this.strategy = this.createPlacementStrategy(placement);
        }

        if (!anchor) {
            this.strategy.destroy();
        } else {
            await this.strategy.update(popover, anchor);
        }

        if (show) {
            await this.strategy.toggle(true);
            popover.showPopover();
            this.subscribe();
        } else {
            this.unsubscribe();
            popover.hidePopover();
            await Promise.allSettled(this.popoverRef.current!.getAnimations().map(animation => animation.finished));
            await this.strategy.toggle(false);
        }
    }

    componentWillUnmount() {
        MediaQueries.smallScreen.removeEventListener("change", this.mediaQueryChangeListener);
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

    private get menuMode() {
        return this.props.mode === "menu" || (this.props.mode === "auto" && !MediaQueries.smallScreen.matches);
    }

    private createPlacementStrategy(placement: any) {
        if (this.menuMode) {
            return new PopoverAnchorStrategy(placement);
        } else {
            return new FixedStrategy();
        }
    }

    private queryAll(selector: string) {
        return this.popoverRef.current!.querySelectorAll<HTMLElement>(selector);
    }

    private subscribe() {
        document.addEventListener("keydown", this.documentKeydownListener);
        activationEvents.forEach(name => document.addEventListener(name, this.preventActivationListener, true));
        this.popoverRef.current!.addEventListener("toggle", this.popoverToggleListener);
    }

    private unsubscribe() {
        document.removeEventListener("keydown", this.documentKeydownListener);
        activationEvents.forEach(name => document.removeEventListener(name, this.preventActivationListener, true));
        this.popoverRef.current!.removeEventListener("toggle", this.popoverToggleListener);
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

    private mediaQueryChangeListener = () => {
        this.strategy.destroy();
        this.strategy = this.createPlacementStrategy(this.props.placement);
        this.forceUpdate();
    }

    private containerClickListener = (event: MouseEvent) => {
        if (event.defaultPrevented) return;
        const item = (event.target as HTMLElement).closest<HTMLElement>(TOGGLE_ITEM_SELECTOR);
        if (item && !this.state.show) {
            this.show(item);
        }
    }

    private popoverToggleListener = (e: Event) => {
        const { oldState, newState } = e as ToggleEvent;
        if (oldState === "open" && newState === "closed") {
            this.hide();
        }
    }

    private popoverClickHandler = (event: ReactMouseEvent<HTMLUListElement>) => {
        const item = (event.target as HTMLElement).closest<HTMLElement>(ENABLED_ITEM_SELECTOR);
        if (item) {
            this.hide();
            this.props.onSelected?.(item, this.state.anchor);
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
            default: return;
        }

        event.preventDefault();
    }

    private preventActivationListener = (event: Event) => {
        // Prevent default browser behavior and stop propagation if event originited outside of our popover
        if (!this.popoverRef.current!.contains((event.target as Node))) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    private focusOutHandler = (event: FocusEvent<HTMLElement>) => {
        if (!this.popoverRef.current?.contains(event.relatedTarget as Node)) {
            this.hide();
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
        const { className, children, placement, render, onSelected, ...other } = this.props;
        const { show, anchor } = this.state;
        const menuMode = this.menuMode;
        const cls = `dropdown-menu user-select-none fade${!menuMode ? " action-sheet slide" : ""}${className ? ` ${className}` : ""}`;
        return <>
            <ul popover="" ref={this.popoverRef} inert={show ? undefined : ""} className={cls} {...other}
                onClick={this.popoverClickHandler} onBlur={this.focusOutHandler}>
                {render ? render(anchor) : children}
            </ul>
        </>
    }
}
