import { createPopper, Instance as PopperInstance } from "@popperjs/core/lib/popper";
import { Placement } from "@popperjs/core/lib/enums";
import React, { HTMLAttributes } from "react";

const ENABLED_ITEM_SELECTOR = ".dropdown-item:not(:disabled):not(.disabled)";
const FOCUSED_SELECTOR = ":focus";
const TOGGLE_ITEM_SELECTOR = "[data-bs-toggle='dropdown']";

export type DropdownMenuProps = Omit<HTMLAttributes<HTMLUListElement>, "onSelect"> & {
    placement?: Placement;
    onSelect?: (item: HTMLElement, anchor?: HTMLElement) => void;
};

export class DropdownMenu extends React.Component<DropdownMenuProps> {

    menuRef = React.createRef<HTMLUListElement>();
    instance: PopperInstance | null = null;

    componentDidMount() {
        this.menuRef.current?.parentElement?.addEventListener("click", this.parentClickListener);
    }

    componentWillUnmount() {
        this.menuRef.current?.parentElement?.removeEventListener("click", this.parentClickListener);
        document.removeEventListener("click", this.documentClickListener, true);
        document.removeEventListener("keydown", this.keydownListener, true);
        this.instance?.destroy();
    }

    toggle = (anchor: HTMLElement) => {
        this.update(anchor, this.menuRef.current as HTMLElement);
    }

    show = (anchor: HTMLElement) => {
        this.update(anchor, this.menuRef.current as HTMLElement, true);
    }

    hide = () => {
        this.update(null, this.menuRef.current as HTMLElement, false);
    }

    private update = (reference: HTMLElement | null, popper: HTMLElement, visibility?: boolean) => {
        if (reference && reference !== this.instance?.state?.elements?.reference) {
            this.instance?.destroy();
            this.instance = createPopper(reference, popper, { placement: this.props.placement ?? "bottom-start" });
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
                if (this.props.onSelect) {
                    this.props.onSelect(item, this.instance?.state.elements.reference as HTMLElement);
                }
            }
            else {
                event.preventDefault();
                event.stopPropagation();
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
                // Simply try to select previouse item other then first one
                this.focusPrev();
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
        const { className, children, placement, onSelect, ...other } = this.props;
        return <ul ref={this.menuRef} className={`dropdown-menu${className ? ` ${className}` : ""}`} style={{ margin: 0 }} {...other}>
            {children}
        </ul>;
    }
}