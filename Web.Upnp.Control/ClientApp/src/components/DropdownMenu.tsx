import { createPopper, Instance as PopperInstance } from "@popperjs/core/lib/popper";
import { Placement } from "@popperjs/core/lib/enums";
import React, { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

const ENABLED_ITEM_SELECTOR = ".dropdown-item:not(:disabled):not(.disabled)";
const FOCUSED_SELECTOR = ":focus";
const TOGGLE_ITEM_SELECTOR = "[data-bs-toggle='dropdown']";

export type DropdownMenuProps = Omit<HTMLAttributes<HTMLUListElement>, "onSelect"> & {
    placement?: Placement;
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
            {glyph && <svg><use href={`#${glyph}`} /></svg>}{children}
        </button>
    </li>
}

export class DropdownMenu extends React.Component<DropdownMenuProps, DropdownMenuState> {

    menuRef = React.createRef<HTMLUListElement>();
    instance: PopperInstance | null = null;
    state: DropdownMenuState = { children: null, show: undefined, anchor: undefined };

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

    private update = (reference: HTMLElement | null, popper: HTMLElement, visibility?: boolean) => {
        if (reference && reference !== this.instance?.state?.elements?.reference) {
            this.instance?.destroy();
            this.instance = createPopper(reference, popper, { placement: this.props.placement ?? "auto" });
        }

        if (popper.classList.toggle("show", visibility)) {
            document.addEventListener("click", this.documentClickListener, true);
            document.addEventListener("keydown", this.keydownListener, true);
            reference?.setAttribute("aria-expanded", "true");
        }
        else {
            document.removeEventListener("click", this.documentClickListener, true);
            document.removeEventListener("keydown", this.keydownListener, true);
            reference?.setAttribute("aria-expanded", "false");
        }
    }

    private query = (selector: string): HTMLElement | null | undefined => this.menuRef.current?.querySelector<HTMLElement>(selector);

    private queryAll = (selector: string): NodeListOf<HTMLElement> | undefined => this.menuRef.current?.querySelectorAll<HTMLElement>(selector);

    //#region Focus helpers

    private focusEntered = () => this.instance?.state.elements.reference !== document.activeElement;

    private focusNext = () => {
        const items = this.queryAll(ENABLED_ITEM_SELECTOR);

        if (!items || items.length === 0) return false;

        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            if (element.matches(FOCUSED_SELECTOR) && index < items.length - 1) {
                items[index + 1].focus();
                return true;
            }
        }

        return false;
    }

    private focusPrev = () => {
        const items = this.queryAll(ENABLED_ITEM_SELECTOR);

        if (!items || items.length === 0) return false;

        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            if (element.matches(FOCUSED_SELECTOR) && index > 0) {
                items[index - 1].focus();
                return true;
            }
        }

        return false;
    }

    //#endregion

    private parentClickListener = (event: MouseEvent) => {
        const item = (event.target as HTMLElement).closest<HTMLElement>(TOGGLE_ITEM_SELECTOR);
        if (item) {
            event.stopPropagation();
            event.preventDefault();
            this.show(item);
        }
    }

    private documentClickListener = (event: MouseEvent) => {
        const menu = (this.menuRef.current as HTMLElement);
        const anchor = (this.instance?.state.elements.reference as HTMLElement);
        const path = event.composedPath();

        if (path.includes(menu)) {
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
        if (!path.includes(anchor)) {
            this.hide();
        }
    }

    private keydownListener = (event: KeyboardEvent) => {
        if (event.code === "Escape" || event.code === "Tab" || event.code === "ArrowUp" || event.code === "ArrowDown") {
            event.stopPropagation();
            event.preventDefault();
        }

        switch (event.code) {
            case "Escape":
                this.hide();
                (this.instance?.state.elements.reference as HTMLElement)?.focus();
                break;
            case "Tab":
                if (!this.focusEntered()) {
                    // Focus not yet entered menu, so focus first item
                    this.query(ENABLED_ITEM_SELECTOR)?.focus();
                } else if (!this.focusNext()) {
                    // Focus already reached last enabled item, so simply hide menu
                    this.hide();
                }
                break;
            case "Space":
                if (!this.focusEntered()) {
                    // Focus not yet entered menu, so focus first item
                    this.query(ENABLED_ITEM_SELECTOR)?.focus();
                }
                break;
            case "ArrowUp":
                if (!this.focusEntered()) {
                    // Focus not yet entered menu, so focus first item
                    this.query(ENABLED_ITEM_SELECTOR)?.focus();
                }
                else {
                    // Try to select prev item other than forst one
                    this.focusPrev();
                }
                break;
            case "ArrowDown":
                if (!this.focusEntered()) {
                    // Focus not yet entered menu, so focus first item
                    this.query(ENABLED_ITEM_SELECTOR)?.focus();
                }
                else {
                    // Try to select next item other than last one
                    this.focusNext();
                }
                break;
        }
    }

    render() {
        const { className, children, placement, render, onSelected, ...other } = this.props;
        return <ul ref={this.menuRef} className={`dropdown-menu${className ? ` ${className}` : ""}`} style={{ margin: 0 }} {...other}>
            {this.state.children ?? children}
        </ul>;
    }
}