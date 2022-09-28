import { Placement } from "@popperjs/core/lib/enums";
import { createPopper, Instance as PopperInstance, OptionsGeneric, StrictModifiers } from "@popperjs/core/lib/popper";
import { ButtonHTMLAttributes, Component, createRef, HTMLAttributes, ReactNode } from "react";
import { createBackNavigationTracker, NavigationBackTracker } from "./BackNavigationTracker";

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

abstract class PlacementStrategy {
    abstract update(popup: HTMLElement, anchor: HTMLElement, visibility: boolean, options?: Partial<OptionsGeneric<StrictModifiers>>): void;
    abstract destroy(): void;
}

export function MenuItem({ className, action, glyph, children, ...other }: ButtonHTMLAttributes<HTMLButtonElement> & { action: string, glyph?: string }) {
    return <li>
        <button type="button" data-action={action} className={`dropdown-item${className ? ` ${className}` : ""}`} {...other}>
            {glyph && <svg><use href={glyph} /></svg>}{children}
        </button>
    </li>
}

export class DropdownMenu extends Component<DropdownMenuProps, DropdownMenuState> {
    popupRef = createRef<HTMLUListElement>();
    state: DropdownMenuState = { show: false, anchor: undefined };
    backNavTracker: NavigationBackTracker;
    strategy: PlacementStrategy;

    static defaultProps: Partial<DropdownMenuProps> = {
        placement: "auto",
        modifiers: [{ name: "offset", options: { offset: [0, 4] } }]
    }

    constructor(props: DropdownMenuProps) {
        super(props);
        this.backNavTracker = createBackNavigationTracker(() => this.hide());
        this.strategy = new PoperPlacementStrategy();
    }

    componentDidMount() {
        this.popupRef.current?.parentElement?.addEventListener("click", this.parentClickListener);
    }

    componentDidUpdate() {
        const { anchor, show } = this.state;
        this.update(anchor, show).then(() => anchor?.focus());
    }

    componentWillUnmount() {
        this.popupRef.current?.parentElement?.removeEventListener("click", this.parentClickListener);
        document.removeEventListener("click", this.documentClickListener, true);
        document.removeEventListener("keydown", this.keydownListener, true);
        this.popupRef.current?.removeEventListener("focusout", this.focusoutListener);

        this.strategy.destroy();
    }

    show = (anchor: HTMLElement) => this.setState({ show: true, anchor });

    hide = () => this.setState({ show: false });

    private update = async (anchor: HTMLElement | undefined, visibility: boolean) => {
        const popup = this.popupRef.current!;

        if (!anchor) {
            this.strategy.destroy();
        } else {
            const { placement, modifiers } = this.props;
            this.strategy.update(popup, anchor, visibility, { placement, modifiers });
        }

        if (popup.classList.toggle("show", visibility)) {
            document.addEventListener("click", this.documentClickListener, true);
            document.addEventListener("keydown", this.keydownListener, true);
            popup.addEventListener("focusout", this.focusoutListener);
            anchor?.setAttribute("aria-expanded", "true");
            await this.backNavTracker.start();
        } else {
            document.removeEventListener("click", this.documentClickListener, true);
            document.removeEventListener("keydown", this.keydownListener, true);
            popup.removeEventListener("focusout", this.focusoutListener);
            anchor?.setAttribute("aria-expanded", "false");
            await this.backNavTracker.stop();
        }
    }

    private queryAll = (selector: string): NodeListOf<HTMLElement> | undefined => this.popupRef.current?.querySelectorAll<HTMLElement>(selector);

    //#region Focus helpers

    private focusNext = () => {
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

    private focusPrev = () => {
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
        const item = (event.target as HTMLElement).closest<HTMLElement>(TOGGLE_ITEM_SELECTOR);
        if (item) {
            event.stopImmediatePropagation();
            this.show(item);
        }
    }

    private documentClickListener = (event: MouseEvent) => {
        if (event.composedPath().includes(this.popupRef.current!)) {
            const item = (event.target as HTMLElement).closest<HTMLElement>(ENABLED_ITEM_SELECTOR);
            if (item && this.props.onSelected) {
                this.props.onSelected(item, this.state.anchor);
            }

            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        this.hide();
    }

    private keydownListener = (event: KeyboardEvent) => {
        switch (event.code) {
            case "Escape":
                this.hide();
                break;
            case "Tab":
                if (this.state.anchor !== document.activeElement) {
                    return;
                }

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

        event.stopPropagation();
        event.preventDefault();
    }

    private focusoutListener = (event: FocusEvent) => {
        if (!this.popupRef.current?.contains(event.relatedTarget as Node)) {
            this.hide();
        }
    }

    render() {
        const { className, children, placement, render, onSelected, modifiers, ...other } = this.props;
        return <ul ref={this.popupRef} className={`dropdown-menu${className ? ` ${className}` : ""}`} {...other}>
            {render ? render(this.state.anchor) : children}
        </ul>
    }
}

class PoperPlacementStrategy extends PlacementStrategy {
    instance: PopperInstance | null = null;

    override update(popup: HTMLElement, anchor: HTMLElement, visible: boolean, options?: Partial<OptionsGeneric<StrictModifiers>> | undefined): void {
        if (this.instance?.state.elements.popper !== popup || this.instance.state.elements.reference != anchor) {
            this.instance?.destroy();
            this.instance = createPopper<StrictModifiers>(anchor, popup, options);
        }

        this.instance.setOptions({
            ...options,
            modifiers: [...(options?.modifiers ?? []), { name: 'eventListeners', enabled: visible }]
        });

        this.instance.update();
    }

    override destroy(): void {
        this.instance?.destroy();
    }
}