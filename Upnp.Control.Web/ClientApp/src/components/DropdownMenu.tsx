import { Placement } from "@popperjs/core/lib/enums";
import { createPopper, Instance as PopperInstance, StrictModifiers } from "@popperjs/core/lib/popper";
import { ButtonHTMLAttributes, Component, createRef, HTMLAttributes, ReactNode } from "react";
import { createBackNavigationTracker, NavigationBackTracker } from "./BackNavigationTracker";

const ENABLED_ITEM_SELECTOR = ".dropdown-item:not(:disabled):not(.disabled)";
const FOCUSED_SELECTOR = ":focus";
const TOGGLE_ITEM_SELECTOR = "[data-bs-toggle='dropdown']";

export type DropdownMenuProps = Omit<HTMLAttributes<HTMLUListElement>, "onSelect"> & {
    placement?: Placement;
    modifiers?: StrictModifiers[];
    onSelected?: (item: HTMLElement, anchor?: HTMLElement) => void;
    render?: (anchor?: HTMLElement | null) => ReactNode;
};

type DropdownMenuState = {
    children?: ReactNode;
    anchor?: HTMLElement;
    show?: boolean;
};

export function MenuItem({ className, action, glyph, children, ...other }: ButtonHTMLAttributes<HTMLButtonElement> & { action: string, glyph?: string }) {
    return <li>
        <button type="button" data-action={action} className={`dropdown-item${className ? ` ${className}` : ""}`} {...other}>
            {glyph && <svg><use href={glyph} /></svg>}{children}
        </button>
    </li>
}

export class DropdownMenu extends Component<DropdownMenuProps, DropdownMenuState> {

    menuRef = createRef<HTMLUListElement>();
    instance: PopperInstance | null = null;
    state: DropdownMenuState = { children: null, show: undefined, anchor: undefined };
    backNavTracker: NavigationBackTracker;
    constructor(props: DropdownMenuProps) {
        super(props);
        this.backNavTracker = createBackNavigationTracker(() => this.hide());
    }

    componentDidMount() {
        this.menuRef.current?.parentElement?.addEventListener("click", this.parentClickListener);
    }

    componentDidUpdate() {
        if (this.state.children)
            this.update(this.state.anchor ?? null, this.menuRef.current as HTMLElement, this.state.show);
    }

    componentWillUnmount() {
        this.menuRef.current?.parentElement?.removeEventListener("click", this.parentClickListener);
        document.removeEventListener("click", this.documentClickListener, true);
        document.removeEventListener("keydown", this.keydownListener, true);
        this.menuRef.current?.removeEventListener("focusout", this.focusoutListener, true);

        this.instance?.destroy();
    }

    show = (anchor: HTMLElement) => {
        if (this.props.render)
            this.setState({ children: this.props.render(anchor), show: true, anchor })
        else
            this.update(anchor, this.menuRef.current as HTMLElement, true);
    }

    hide = () => {
        if (this.props.render)
            this.setState({ show: false, anchor: undefined })
        else
            this.update(null, this.menuRef.current as HTMLElement, false);
    }

    private update = async (reference: HTMLElement | null, popper: HTMLElement, visibility?: boolean) => {
        if (reference && reference !== this.instance?.state?.elements?.reference) {
            this.instance?.destroy();
            this.instance = createPopper<StrictModifiers>(reference, popper, {
                placement: this.props.placement ?? "auto",
                modifiers: this.props.modifiers ?? []
            });
        }

        if (popper.classList.toggle("show", visibility)) {
            document.addEventListener("click", this.documentClickListener, true);
            document.addEventListener("keydown", this.keydownListener, true);
            this.menuRef.current?.addEventListener("focusout", this.focusoutListener, true);

            reference?.setAttribute("aria-expanded", "true");

            if (this.instance) {
                const options = {
                    ...this.instance.state.options,
                    modifiers: [
                        ...(this.props.modifiers ?? []),
                        { name: 'eventListeners', enabled: true }]
                };
                this.instance.setOptions(options);
                this.instance.update();
            }

            this.backNavTracker.start();
        } else {
            document.removeEventListener("click", this.documentClickListener, true);
            document.removeEventListener("keydown", this.keydownListener, true);
            this.menuRef.current?.removeEventListener("focusout", this.focusoutListener, true);

            reference?.setAttribute("aria-expanded", "false");

            if (this.instance) {
                const options = {
                    ...this.instance.state.options,
                    modifiers: [
                        ...(this.props.modifiers ?? []),
                        { name: 'eventListeners', enabled: false }]
                };
                this.instance.setOptions(options);
                this.instance.update();
            }

            await this.backNavTracker.stop();
            this.restoreFocus();
        }
    }

    private queryAll = (selector: string): NodeListOf<HTMLElement> | undefined => this.menuRef.current?.querySelectorAll<HTMLElement>(selector);

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

    private restoreFocus = () => {
        (this.instance?.state.elements.reference as HTMLElement)?.focus();
    }

    //#endregion

    private parentClickListener = (event: MouseEvent) => {
        const item = (event.target as HTMLElement).closest<HTMLElement>(TOGGLE_ITEM_SELECTOR);
        if (item) {
            this.show(item);
        }
    }

    private documentClickListener = (event: MouseEvent) => {
        if (event.composedPath().includes(this.menuRef.current!)) {
            const item = (event.target as HTMLElement).closest<HTMLElement>(ENABLED_ITEM_SELECTOR);
            if (item) {
                this.hide();
                if (this.props.onSelected) {
                    this.props.onSelected(item, this.instance?.state.elements.reference as HTMLElement);
                }
            }
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.hide();
    }

    private keydownListener = (event: KeyboardEvent) => {
        switch (event.code) {
            case "Escape":
                this.hide();
                break;
            case "Tab":
                if (this.instance?.state.elements.reference !== document.activeElement) {
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
        if (!this.menuRef.current?.contains(event.relatedTarget as Node)) {
            this.hide();
        }
    }

    render() {
        const { className, children, placement, render, onSelected, modifiers, ...other } = this.props;
        return <ul ref={this.menuRef} className={`dropdown-menu${className ? ` ${className}` : ""}`} style={{ margin: 0 }} {...other}>
            {this.state.children ?? children}
        </ul>
    }
}