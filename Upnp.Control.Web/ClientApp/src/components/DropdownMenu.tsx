import { Placement } from "@popperjs/core/lib/enums";
import { createPopper, Instance as PopperInstance, StrictModifiers } from "@popperjs/core/lib/popper";
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
    show?: boolean;
}

const defaults: StrictModifiers[] = [
    { name: "offset", options: { offset: [4, 4] } }
]

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
    state: DropdownMenuState = { show: false, anchor: undefined };
    backNavTracker: NavigationBackTracker;

    static defaultProps: Partial<DropdownMenuProps> = {
        placement: "auto"
    }

    constructor(props: DropdownMenuProps) {
        super(props);
        this.backNavTracker = createBackNavigationTracker(() => this.hide());
    }

    componentDidMount() {
        this.menuRef.current?.parentElement?.addEventListener("click", this.parentClickListener);
    }

    componentDidUpdate() {
        this.update(this.state.anchor, this.state.show);
    }

    componentWillUnmount() {
        this.menuRef.current?.parentElement?.removeEventListener("click", this.parentClickListener);
        document.removeEventListener("click", this.documentClickListener, true);
        document.removeEventListener("keydown", this.keydownListener, true);
        this.menuRef.current?.removeEventListener("focusout", this.focusoutListener, true);

        this.instance?.destroy();
    }

    show = (anchor: HTMLElement) => {
        this.setState({ show: true, anchor })
    }

    hide = () => {
        this.setState({ show: false })
    }

    private update = async (reference: HTMLElement | undefined, visibility?: boolean) => {
        const dropdown = this.menuRef.current!;

        if (reference && reference !== this.instance?.state.elements.reference) {
            this.popperInit(reference, dropdown);
        }

        if (dropdown.classList.toggle("show", visibility)) {
            document.addEventListener("click", this.documentClickListener, true);
            document.addEventListener("keydown", this.keydownListener, true);
            this.menuRef.current?.addEventListener("focusout", this.focusoutListener, true);
            reference?.setAttribute("aria-expanded", "true");
            this.setPopperOptions(true);
            await this.backNavTracker.start();
        } else {
            document.removeEventListener("click", this.documentClickListener, true);
            document.removeEventListener("keydown", this.keydownListener, true);
            this.menuRef.current?.removeEventListener("focusout", this.focusoutListener, true);
            reference?.setAttribute("aria-expanded", "false");
            this.setPopperOptions(false);
            await this.backNavTracker.stop();
        }

        this.restoreFocus();
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
        this.state.anchor?.focus();
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
                    this.props.onSelected(item, this.state.anchor);
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
        if (!this.menuRef.current?.contains(event.relatedTarget as Node)) {
            this.hide();
        }
    }

    private setPopperOptions = (enabled: boolean) => {
        if (this.instance) {
            const options = {
                ...this.instance.state.options,
                modifiers: [
                    ...defaults,
                    ...(this.props.modifiers ?? []),
                    { name: 'eventListeners', enabled: enabled }
                ]
            };
            this.instance.setOptions(options);
            this.instance.update();
        }
    }

    private popperInit = (reference: HTMLElement, popper: HTMLElement) => {
        this.instance?.destroy();
        this.instance = createPopper<StrictModifiers>(reference, popper, {
            placement: this.props.placement,
            modifiers: [...defaults, ...(this.props.modifiers ?? [])]
        });
    }

    render() {
        const { className, children, placement, render, onSelected, modifiers, ...other } = this.props;
        return <ul ref={this.menuRef} className={`dropdown-menu${className ? ` ${className}` : ""}`} style={{ margin: 0 }} {...other}>
            {render ? render(this.state.anchor) : children}
        </ul>
    }
}