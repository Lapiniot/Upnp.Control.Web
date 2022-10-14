import { Placement } from "@popperjs/core/lib/enums";
import { StrictModifiers } from "@popperjs/core/lib/popper";
import { ButtonHTMLAttributes, createRef, HTMLAttributes, PureComponent, ReactNode } from "react";
import { createBackNavigationTracker, NavigationBackTracker } from "./BackNavigationTracker";
import { PopperStrategy, PopupPlacementStrategy } from "./PopupPlacementStrategy";

const ENABLED_ITEM_SELECTOR = ".dropdown-item:not(:disabled):not(.disabled)";
const FOCUSED_SELECTOR = ":focus";
const TOGGLE_ITEM_SELECTOR = "[data-toggle='dropdown']";

export type DropdownMenuProps = Omit<HTMLAttributes<HTMLUListElement>, "onSelect"> & {
    placement?: Placement;
    modifiers?: StrictModifiers[];
    onSelected?: (item: HTMLElement, anchor?: HTMLElement) => void;
    render?: (anchor?: HTMLElement | null) => ReactNode;
}

type DropdownMenuState = {
    anchor?: HTMLElement;
    show: boolean;
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
    skipActivation: boolean = false;

    static defaultProps: Partial<DropdownMenuProps> = {
        placement: "auto",
        modifiers: [{ name: "offset", options: { offset: [0, 5] } }]
    }

    constructor(props: DropdownMenuProps) {
        super(props);
        this.backNavTracker = createBackNavigationTracker(() => this.hide());
        this.strategy = new PopperStrategy();
    }

    componentDidMount() {
        this.popupRef.current?.parentElement?.addEventListener("click", this.parentClickListener);
    }

    componentDidUpdate() {
        const { anchor, show } = this.state;
        this.update(anchor, show).then(() => {
            anchor?.focus();
            this.skipActivation = false;
        });
    }

    componentWillUnmount() {
        this.popupRef.current?.parentElement?.removeEventListener("click", this.parentClickListener);
        this.unsubscribe();
        this.strategy.destroy();
    }

    show(anchor: HTMLElement) {
        this.setState({ show: true, anchor });
    }

    hide() {
        this.setState({ show: false });
    }

    private async update(anchor: HTMLElement | undefined, visibility: boolean) {
        const popup = this.popupRef.current!;

        if (!anchor) {
            this.strategy.destroy();
        } else {
            const { placement, modifiers } = this.props;
            await this.strategy.update(popup, anchor, { placement, modifiers });
        }

        if (popup.classList.contains("show") === visibility) return;

        await this.strategy.toggle(visibility);

        if (visibility) {
            this.subscribe();
            await this.backNavTracker.start();
        } else {
            this.unsubscribe();
            await this.backNavTracker.stop();
        }
    }

    private queryAll(selector: string) {
        return this.popupRef.current!.querySelectorAll<HTMLElement>(selector);
    }

    private subscribe() {
        const popup = this.popupRef.current!;
        document.addEventListener("pointerdown", this.documentPointerdownListener, true);
        document.addEventListener("keydown", this.documentKeydownListener, true);
        popup.addEventListener("focusout", this.focusoutListener);
        popup.addEventListener("click", this.clickListener);
    }

    private unsubscribe() {
        const popup = this.popupRef.current!;
        document.removeEventListener("pointerdown", this.documentPointerdownListener, true);
        document.removeEventListener("keydown", this.documentKeydownListener, true);
        popup.removeEventListener("focusout", this.focusoutListener);
        popup.removeEventListener("click", this.clickListener);
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

    private parentClickListener = (event: MouseEvent) => {
        if (this.skipActivation) return;

        const item = (event.target as HTMLElement).closest<HTMLElement>(TOGGLE_ITEM_SELECTOR);
        if (item) {
            event.stopPropagation();
            this.show(item);
        }
    }

    private documentPointerdownListener = (event: PointerEvent) => {
        if (event.composedPath().includes(this.popupRef.current!))
            return;

        this.skipActivation = true;
        event.preventDefault();
        event.stopImmediatePropagation();
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

    private clickListener = (event: MouseEvent) => {
        const item = (event.target as HTMLElement).closest<HTMLElement>(ENABLED_ITEM_SELECTOR);
        if (item) {
            this.hide();
            this.props.onSelected?.(item, this.state.anchor);
        }
    }

    private focusoutListener = (event: FocusEvent) => {
        if (!this.popupRef.current?.contains(event.relatedTarget as Node)) {
            this.hide();
        }
    }

    render() {
        const { className, children, placement, render, onSelected, modifiers, ...other } = this.props;
        const { show, anchor } = this.state;
        const cls = `dropdown-menu fade${className ? ` ${className}` : ""}`;
        return <ul ref={this.popupRef} inert={show ? undefined : ""} className={cls} {...other}>
            {render ? render(anchor) : children}
        </ul>
    }
}