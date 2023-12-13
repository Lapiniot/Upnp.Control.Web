import { Placement } from "@popperjs/core/lib/enums";
import { ButtonHTMLAttributes, createRef, HTMLAttributes, PureComponent, ReactNode, FocusEvent, MouseEvent } from "react";
import { createBackNavigationTracker, NavigationBackTracker } from "./BackNavigationTracker";
import { SwipeGestureRecognizer, SwipeGestures } from "./gestures/SwipeGestureRecognizer";
import { MediaQueries } from "./MediaQueries";
import { FixedStrategy, PopperStrategy, PopupPlacementStrategy } from "./PopupPlacementStrategy";

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

function animationsFinished(element: HTMLElement) {
    return Promise.allSettled(element.getAnimations().map(a => a.finished));
}

export function MenuItem({ className, action, glyph, children, ...other }: ButtonHTMLAttributes<HTMLButtonElement> & { action?: string, glyph?: string }) {
    return <li>
        <button type="button" data-action={action} className={`dropdown-item${className ? ` ${className}` : ""}`} {...other}>
            {glyph && <svg><use href={glyph} /></svg>}{children}
        </button>
    </li>
}

export class DropdownMenu extends PureComponent<DropdownMenuProps, DropdownMenuState> {
    private readonly popupRef = createRef<HTMLUListElement>();
    private readonly swipeRecognizer: SwipeGestureRecognizer;
    private readonly observer: ResizeObserver;
    private backNavTracker: NavigationBackTracker;
    private strategy: PopupPlacementStrategy;
    state: DropdownMenuState = { show: false, anchor: undefined };
    static defaultProps: Partial<DropdownMenuProps> = {
        mode: "auto",
        placement: "auto"
    }

    constructor(props: DropdownMenuProps) {
        super(props);
        this.backNavTracker = createBackNavigationTracker(() => this.hide());
        this.strategy = this.createPlacementStrategy();
        this.swipeRecognizer = new SwipeGestureRecognizer(this.swipeGestureHandler);
        this.observer = new ResizeObserver(this.resizeCallback);
    }

    componentDidMount() {
        this.popupRef.current?.parentElement?.addEventListener("click", this.parentClickListener);
        MediaQueries.smallScreen.addEventListener("change", this.mediaQueryChange);
        this.observer.observe(this.popupRef.current!);
    }

    override async componentDidUpdate({ mode: prevMode }: Readonly<DropdownMenuProps>): Promise<void> {
        const popup = this.popupRef.current!;
        const { anchor, show } = this.state;
        const { mode } = this.props;

        if (mode !== prevMode) {
            this.strategy.destroy();
            this.strategy = this.createPlacementStrategy();
        }

        if (!anchor) {
            this.strategy.destroy();
        } else {
            await this.strategy.update(popup, anchor);
        }

        anchor?.focus();

        popup.classList.add("showing");
        if (show) {
            popup.classList.add("show");
            popup.offsetHeight;
            await this.strategy.toggle(true);
            popup.classList.remove("showing");
            await animationsFinished(popup);
            this.subscribe();
            await this.backNavTracker.start();
        } else {
            await animationsFinished(popup);
            popup.classList.remove("show", "showing");
            await this.strategy.toggle(false);
            this.unsubscribe();
            await this.backNavTracker.stop();
        }
    }

    componentWillUnmount() {
        MediaQueries.smallScreen.removeEventListener("change", this.mediaQueryChange);
        this.popupRef.current!.parentElement!.removeEventListener("click", this.parentClickListener);
        this.unsubscribe();
        this.strategy.destroy();
        this.swipeRecognizer.unbind();
        this.observer.disconnect();
    }

    show(anchor: HTMLElement) {
        this.setState({ show: true, anchor });
    }

    hide() {
        this.setState({ show: false });
    }

    private get menuMode() {
        return this.props.mode === "menu" || (this.props.mode === "auto" && !MediaQueries.smallScreen.matches);
    }

    private createPlacementStrategy() {
        if (this.menuMode) {
            return new PopperStrategy();
        } else {
            return new FixedStrategy();
        }
    }

    private mediaQueryChange = () => {
        this.strategy.destroy();
        this.strategy = this.createPlacementStrategy();
        this.forceUpdate();
    }

    private queryAll(selector: string) {
        return this.popupRef.current!.querySelectorAll<HTMLElement>(selector);
    }

    private subscribe() {
        document.addEventListener("pointerdown", this.documentPointerdownListener, true);
        document.addEventListener("keydown", this.documentKeydownListener, true);
    }

    private unsubscribe() {
        document.removeEventListener("pointerdown", this.documentPointerdownListener, true);
        document.removeEventListener("keydown", this.documentKeydownListener, true);
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

    private parentClickListener = (event: globalThis.MouseEvent) => {
        if (event.defaultPrevented) return;
        const item = (event.target as HTMLElement).closest<HTMLElement>(TOGGLE_ITEM_SELECTOR);
        if (item) {
            this.show(item);
        }
    }

    private documentPointerdownListener = (event: PointerEvent) => {
        if (event.composedPath().includes(this.popupRef.current!))
            return;

        event.preventDefault();

        const state = { id: event.pointerId, type: event.pointerType };
        event.currentTarget!.addEventListener("click", (e: Event) => {
            if (e instanceof PointerEvent && e.pointerId === state.id && e.pointerType === state.type) {
                e.preventDefault();
            }
        }, { capture: true, once: true });

        this.hide();
    }

    private documentKeydownListener = (event: KeyboardEvent) => {
        switch (event.code) {
            case "Escape":
                this.hide();
                break;
            case "Tab":
                if (this.state.anchor !== document.activeElement)
                    return;

                if (event.shiftKey)
                    this.focusPrev();
                else
                    this.focusNext();

                break;
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

    private clickHandler = (event: MouseEvent<HTMLUListElement>) => {
        const item = (event.target as HTMLElement).closest<HTMLElement>(ENABLED_ITEM_SELECTOR);
        if (item) {
            this.hide();
            this.props.onSelected?.(item, this.state.anchor);
        }
    }

    private focusOutHandler = (event: FocusEvent<HTMLElement>) => {
        if (!this.popupRef.current?.contains(event.relatedTarget as Node)) {
            this.hide();
        }
    }

    private resizeCallback = ([{ target: { scrollHeight, clientHeight } }]: ResizeObserverEntry[]) => {
        if (scrollHeight > clientHeight || clientHeight === 0) {
            // Popup element has content overflow (or simply hidden), so stop swipe-down gesture tracking and 
            // prefere browser native behavior(content scrolling).
            this.swipeRecognizer.unbind();
            this.popupRef.current!.classList.toggle("touch-none", false);
        } else {
            this.popupRef.current!.classList.toggle("touch-none", true);
            this.swipeRecognizer.bind(this.popupRef.current!);
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
            <ul ref={this.popupRef} inert={show ? undefined : ""} className={cls}
                onClick={show ? this.clickHandler : undefined} onBlur={show ? this.focusOutHandler : undefined} {...other}>
                {render ? render(anchor) : children}
            </ul>
            {!menuMode && <div className="backdrop" />}
        </>
    }
}