import { debounce } from "./Extensions";

export abstract class PopupPlacementStrategy {
    public abstract update(popup: HTMLElement, anchor: HTMLElement): Promise<void> | void;
    public abstract toggle(visibility: boolean): Promise<void> | void;
    public abstract destroy(): void;
    public [Symbol.dispose] = () => this.destroy();
}

type MainPlacement = "left" | "right" | "top" | "bottom"
type AltPlacement = "start" | "end" | "center"
export type Placement = `${MainPlacement}-${AltPlacement}` | "auto"
interface Point { x: number; y: number; }
interface Size { width: number; height: number; }
type Margin = [top: number, right: number, bottom: number, left: number]
type Rect = Point & Size;
type PositionCalculators = { [K in Placement]: { (size: Size, anchorRect: Rect, options: typeof defaults): Point } }

const defaults = {
    distance: 8,
    flip: <"main" | "alt" | boolean | undefined>true,
    resize: <"width" | "height" | boolean | undefined>true,
    margin: <Margin>[-16, -16, -16, -16]
}

//#region Precomputed maps

const positions: PositionCalculators = {
    "left-start": ({ width }, { x, y }, { distance: offset }) => ({ x: Math.round(x - width - offset), y }),
    "left-end": ({ width, height }, { x, y, height: h }, { distance: offset }) => ({ x: x - width - offset, y: y - height + h }),
    "left-center": ({ width, height }, { x, y, height: h }, { distance: offset }) => ({ x: x - width - offset, y: y - (height - h) / 2 }),
    "right-start": (_, { x, y, width: w }, { distance: offset }) => ({ x: x + w + offset, y }),
    "right-end": ({ height }, { x, y, width: w, height: h }, { distance: offset }) => ({ x: x + w + offset, y: y - height + h }),
    "right-center": ({ height }, { x, y, width: w, height: h }, { distance: offset }) => ({ x: x + w + offset, y: y - (height - h) / 2 }),
    "top-start": ({ height }, { x, y }, { distance: offset }) => ({ x, y: y - height - offset }),
    "top-end": ({ width, height }, { x, y, width: w }, { distance: offset }) => ({ x: x + w - width, y: y - height - offset }),
    "top-center": ({ width, height }, { x, y, width: w }, { distance: offset }) => ({ x: x + (w - width) / 2, y: y - height - offset }),
    "bottom-start": (_, { x, y, height: h }, { distance: offset }) => ({ x, y: y + h + offset }),
    "bottom-end": ({ width }, { x, y, width: w, height: h }, { distance: offset }) => ({ x: x + w - width, y: y + h + offset }),
    "bottom-center": ({ width }, { x, y, width: w, height: h }, { distance: offset }) => ({ x: x + (w - width) / 2, y: y + h + offset }),
    auto({ }, { }) {
        return { x: 0, y: 0 }
    }
}

const flipMap: { [K in Placement]: Placement } = {
    "left-start": "left-end",
    "left-end": "left-start",
    "right-start": "right-end",
    "right-end": "right-start",
    "top-start": "top-end",
    "top-end": "top-start",
    "bottom-start": "bottom-end",
    "bottom-end": "bottom-start",
    "left-center": "left-center",
    "right-center": "right-center",
    "top-center": "top-center",
    "bottom-center": "bottom-center",
    "auto": "auto"
}

const altFlipMap: { [K in Placement]: Placement } = {
    "left-start": "right-start",
    "left-end": "right-end",
    "left-center": "right-center",
    "right-start": "left-start",
    "right-end": "left-end",
    "right-center": "left-center",
    "top-start": "bottom-start",
    "top-end": "bottom-end",
    "top-center": "bottom-center",
    "bottom-start": "top-start",
    "bottom-end": "top-end",
    "bottom-center": "top-center",
    auto: "auto"
}

//#endregion

//#region Utility functions

function getIntersectionRatio(rect: Rect, other: Rect) {
    const overflowTop = Math.max(0, other.y - rect.y);
    const overflowBottom = Math.max(0, rect.y + rect.height - other.y - other.height);
    const overflowLeft = Math.max(0, other.x - rect.x);
    const overflowRight = Math.max(0, rect.x + rect.width - other.x - other.width);
    const intersectionWidth = rect.width - overflowLeft - overflowRight;
    const intersectionHeight = rect.height - overflowTop - overflowBottom;
    return (intersectionWidth) * (intersectionHeight) / (rect.width * rect.height);
}

function getViewportRect([top, right, bottom, left]: Margin = [0, 0, 0, 0]): Rect {
    const { clientLeft, clientTop, clientWidth, clientHeight } = window.document.documentElement;
    return { x: clientLeft - left, y: clientTop - top, width: clientWidth + left + right, height: clientHeight + top + bottom };
}

function getFallbackPlacements(placement: Placement, flip: typeof defaults.flip) {
    const placements: Placement[] = [];

    if (flip === "main" || flip === true) {
        const mainFlipPlacement = flipMap[placement];
        if (mainFlipPlacement !== placement)
            placements.push(mainFlipPlacement);
    }

    if (flip === "alt" || flip === true) {
        const altFlipPlacement = altFlipMap[placement];
        if (altFlipPlacement !== placement)
            placements.push(altFlipPlacement);

        if (flip === true) {
            const altMainPlacement = flipMap[altFlipPlacement];
            if (altMainPlacement !== altFlipPlacement)
                placements.push(altMainPlacement);
        }
    }

    return placements;
}

function getOptimalPlacement(anchorRect: Rect, rootBounds: Rect): Placement {
    const { x: ax, y: ay, width: aw, height: ah } = anchorRect;
    const { x: bx, y: by, width: bw, height: bh } = rootBounds;
    return `${ax - bx > bx + bw - ax - aw ? "left" : "right"}-${ay - by > by + bh - ay - ah ? "end" : "start"}`;
}

//#endregion

export class PopoverAnchorStrategy extends PopupPlacementStrategy {
    popup: HTMLElement | undefined;
    anchor: HTMLElement | undefined;
    resizeObserver: ResizeObserver;
    options: typeof defaults;
    intrinsicWidth = 0;
    intrinsicHeight = 0;

    constructor(public readonly placement: Placement, options?: Partial<typeof defaults>) {
        super();
        this.options = { ...defaults, ...options };
        this.resizeObserver = new ResizeObserver(this.resizeCallback);
    }

    public override update(popup: HTMLElement, anchor: HTMLElement): void | Promise<void> {
        if (this.popup && this.popup !== popup) {
            this.unsubscribe();
        }

        this.anchor = anchor;
        this.popup = popup;
    }

    public override toggle(visibility: boolean): void | Promise<void> {
        if (this.popup && this.anchor) {
            if (visibility) {
                this.subscribe();
            }
            else {
                this.unsubscribe();
            }
            this.reset();
        }
    }

    public override destroy(): void {
        this.resizeObserver.disconnect();
    }

    private subscribe() {
        this.resizeObserver.observe(this.popup!);
        this.resizeObserver.observe(document.documentElement);
    }

    private unsubscribe() {
        this.resizeObserver.unobserve(this.popup!);
        this.resizeObserver.unobserve(document.documentElement);
    }

    private resizeCallback = ([entry]: ResizeObserverEntry[], observer: ResizeObserver) => {
        const { borderBoxSize: [{ inlineSize, blockSize }], target } = entry;
        // Reposition target only when it is visible
        if (target === this.popup && blockSize > 0 && inlineSize > 0 && this.anchor) {
            observer.unobserve(this.popup!);
            this.intrinsicWidth = inlineSize;
            this.intrinsicHeight = blockSize;
            this.reflow();
        } else if (target === document.documentElement) {
            this.reflowDebounced();
        }
    }

    private reflow() {
        this.tetherToAnchor(this.intrinsicWidth, this.intrinsicHeight,
            this.anchor!.getBoundingClientRect(),
            getViewportRect(this.options.margin));
    }

    private reflowDebounced = debounce(this.reflow, 125);

    private reset() {
        this.intrinsicWidth = 0;
        this.intrinsicHeight = 0;
        this.popup!.style.maxHeight = "";
        this.popup!.style.maxWidth = "";
    }

    private tetherToAnchor(inlineSize: number, blockSize: number, anchor: Rect, root: Rect) {
        const { flip } = this.options;
        const size: Size = { width: inlineSize, height: blockSize };
        let placement = this.placement === "auto" ? getOptimalPlacement(anchor, root) : this.placement;
        let point = positions[placement](size, anchor, this.options);
        if (flip && this.placement !== "auto") {
            // Check whether desired placement provides 100% visibility 
            let ratio = getIntersectionRatio({ ...point, ...size }, root);
            if (ratio < 1) {
                // partial intersection with view-port detected, so try to compute 
                // optimal fallback placements allowed by options.flip setting
                const fallbacks = getFallbackPlacements(placement, flip);
                // compute the best intersecting placement
                for (let index = 0; index < fallbacks.length; index++) {
                    const fallback = fallbacks[index];
                    const pt = positions[fallback](size, anchor, this.options);
                    const r = getIntersectionRatio({ ...pt, ...size }, root);
                    if (r > ratio) {
                        ratio = r;
                        point = pt;
                        placement = fallback;
                    }
                }
            }
        }

        const popup = this.popup!;
        const resize = this.options.resize;
        let top = point.y, left = point.x, maxw = 0, maxh = 0;

        if (resize === "width" || resize === true) {
            if (placement === "top-center" || placement === "bottom-center") {
                const overflow = Math.round(Math.max(point.x + inlineSize - root.x - root.width, root.x - point.x, 0));
                if (overflow > 0) {
                    maxw = inlineSize - 2 * overflow;
                    left = point.x + overflow;
                }
            }
            else {
                const overflow = Math.round(Math.max(root.x - point.x, 0) +
                    Math.max(point.x + inlineSize - root.x - root.width, 0));
                if (overflow > 0) {
                    maxw = inlineSize - overflow;
                    if (placement.startsWith("left-") || placement === "bottom-end" || placement === "top-end") {
                        left += overflow;
                    }
                }
            }
        }

        if (resize === "height" || resize === true) {
            if (placement === "left-center" || placement === "right-center") {
                const overflow = Math.round(Math.max(point.y + blockSize - root.y - root.height, root.y - point.y, 0));
                if (overflow > 0) {
                    maxh = blockSize - 2 * overflow;
                    top = point.y + overflow;
                }
            }
            else {
                const overflow = Math.round(Math.max(root.y - point.y,
                    point.y + blockSize - root.y - root.height, 0));
                if (overflow > 0) {
                    maxh = blockSize - overflow;
                    if (placement.startsWith("top-") || placement === "left-end" || placement === "right-end") {
                        top += overflow;
                    }
                }
            }
        }

        popup.style.position = "fixed";
        popup.style.maxWidth = maxw > 0 ? Math.round(maxw) + "px" : "";
        popup.style.maxHeight = maxh > 0 ? Math.round(maxh) + "px" : "";
        popup.style.inset = `${Math.round(top)}px auto auto ${Math.round(left)}px`;
    }
}

export class FixedStrategy extends PopupPlacementStrategy {
    public override update() {
    }

    public override destroy() {
    }

    public override toggle() {
    }
}
