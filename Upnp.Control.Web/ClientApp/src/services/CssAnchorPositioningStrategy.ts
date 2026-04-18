import { PopoverPlacementStrategy } from "@services/PopoverPlacementStrategy";

export class CssAnchorPositioningStrategy extends PopoverPlacementStrategy {
    popover: HTMLElement | undefined;
    anchor: HTMLElement | undefined;

    constructor() {
        super();
    }

    public override update(popup: HTMLElement, anchor?: HTMLElement): Promise<void> | void {
        this.popover = popup;
        this.anchor = anchor;
    }

    public override toggle(visibility: boolean): Promise<void> | void {
        const { popover, anchor } = this;

        if (!anchor || !popover) {
            return;
        }

        if (visibility) {
            const name = getAnchorName(anchor);
            anchor.style.anchorName = name;
            popover.style.positionAnchor = name;
        } else {
            popover.style.positionAnchor = "";
        }
    }

    public override destroy(): void {
    }
}

function getAnchorName(anchor: HTMLElement) {
    if (anchor.style.anchorName !== "") {
        return anchor.style.anchorName;
    }

    if (popoverInvoker(anchor) && anchor.popoverTargetElement) {
        return "";
    }

    if (anchor.id !== '') {
        return `--anchor-${anchor.id}`;
    }

    return `--anchor-${generateId()}`;
}

function popoverInvoker(element: HTMLElement): element is (HTMLButtonElement | HTMLInputElement) {
    return element instanceof HTMLButtonElement || element instanceof HTMLInputElement;
}

const generateId = Object.assign(
    () => generateId.seed++,
    { seed: Math.trunc(Date.now()) }
)