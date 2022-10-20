import { Placement } from "@popperjs/core/lib/enums";
import { StrictModifiers } from "@popperjs/core/lib/popper";
import { ButtonHTMLAttributes, createRef, HTMLAttributes, PureComponent, ReactNode, FocusEvent, MouseEvent } from "react";
import { createBackNavigationTracker, NavigationBackTracker } from "./BackNavigationTracker";
import { MediaQueries } from "./MediaQueries";
import { FixedStrategy, PopperStrategy, PopupPlacementStrategy } from "./PopupPlacementStrategy";

const ENABLED_ITEM_SELECTOR = ".dropdown-item:not(:disabled):not(.disabled)";
const FOCUSED_SELECTOR = ":focus";
const TOGGLE_ITEM_SELECTOR = "[data-toggle='dropdown']";

type DropdownMode = "menu" | "action-sheet" | "auto";

export type DropdownMenuProps = Omit<HTMLAttributes<HTMLUListElement>, "onSelect"> & {
    mode: DropdownMode,
    placement: Placement,
    modifiers: StrictModifiers[],
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

export function MenuItem({ className, action, glyph, children, ...other }: ButtonHTMLAttributes<HTMLButtonElement> & { action: string, glyph?: string }) {
    return <li>
        <button type="button" data-action={action} className={`dropdown-item${className ? ` ${className}` : ""}`} {...other}>
            {glyph && <svg><use href={glyph} /></svg>}{children}
        </button>
    </li>
}

export class DropdownMenu extends PureComponent<DropdownMenuProps, DropdownMenuState> {
    popupRef = createRef<HTMLUListElement>();
    state: DropdownMenuState = { show: false, anchor: undefined };
    backNavTracker: NavigationBackTracker;
    strategy: PopupPlacementStrategy;

    static defaultProps: Partial<DropdownMenuProps> = {
        mode: "auto",
        placement: "auto",
        modifiers: [{ name: "offset", options: { offset: [0, 5] } }]
    }

    constructor(props: DropdownMenuProps) {
        super(props);
        this.backNavTracker = createBackNavigationTracker(() => this.hide());
        this.strategy = this.createPlacementStrategy();
    }

    private get menuMode() {
        return this.props.mode === "menu" || (this.props.mode === "auto" && MediaQueries.screenWidth("576px").matches);
    }

    private createPlacementStrategy() {
        if (this.menuMode) {
            return new PopperStrategy();
        } else {
            return new FixedStrategy();
        }
    }

    componentDidMount() {
        this.popupRef.current?.parentElement?.addEventListener("click", this.parentClickListener);
    }

    override async componentDidUpdate({ mode: prevMode }: Readonly<DropdownMenuProps>): Promise<void> {
        const popup = this.popupRef.current!;
        const { anchor, show } = this.state;
        const { placement, modifiers, mode } = this.props;

        if (mode !== prevMode) {
            this.strategy.destroy();
            this.strategy = this.createPlacementStrategy();
        }

        if (!anchor) {
            this.strategy.destroy();
        } else {
            await this.strategy.update(popup, anchor, { placement, modifiers });
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
        this.popupRef.current!.parentElement!.removeEventListener("click", this.parentClickListener);
        this.unsubscribe();
        this.strategy.destroy();
    }

    show(anchor: HTMLElement) {
        this.setState({ show: true, anchor });
    }

    hide() {
        this.setState({ show: false });
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
        const item = (event.target as HTMLElement).closest<HTMLElement>(TOGGLE_ITEM_SELECTOR);
        if (item) {
            event.stopPropagation();
            this.show(item);
        }
    }

    private documentPointerdownListener = (event: PointerEvent) => {
        if (event.composedPath().includes(this.popupRef.current!))
            return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const state = { id: event.pointerId, type: event.pointerType };
        event.currentTarget!.addEventListener("click", (e: Event) => {
            if (e instanceof PointerEvent && e.pointerId === state.id && e.pointerType === state.type) {
                e.stopImmediatePropagation();
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

        event.stopImmediatePropagation();
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
            event.preventDefault();
            event.nativeEvent.stopImmediatePropagation();
            this.hide();
        }
    }

    render() {
        const { className, children, placement, render, onSelected, modifiers, ...other } = this.props;
        const { show, anchor } = this.state;
        const menuMode = this.menuMode;
        const cls = `dropdown-menu fade${!menuMode ? " action-sheet slide" : ""}${className ? ` ${className}` : ""}`;
        return <>
            <ul ref={this.popupRef} inert={show ? undefined : ""} className={cls}
                onClick={show ? this.clickHandler : undefined} onBlur={show ? this.focusOutHandler : undefined} {...other}>
                {render ? render(anchor) : children}
            </ul>
            {!menuMode && <div className="backdrop" />}
        </>
    }
}