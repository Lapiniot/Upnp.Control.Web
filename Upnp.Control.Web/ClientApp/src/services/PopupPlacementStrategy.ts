export abstract class PopupPlacementStrategy {
    public abstract update(popup: HTMLElement, anchor: HTMLElement): Promise<void> | void;
    public abstract toggle(visibility: boolean): Promise<void> | void;
    public abstract destroy(): void;
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
    distance: 5,
    flip: <"main" | "alt" | boolean | undefined>true,
    resize: <"width" | "height" | boolean | undefined>"height",
    margin: <Margin>[-5, -5, -5, -5]
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
    intersectionObserver: IntersectionObserver;
    options: typeof defaults;
    maxHeight: string = "";
    maxWidth: string = "";

    constructor(public readonly placement: Placement, options?: Partial<typeof defaults>) {
        super();
        this.options = { ...defaults, ...options };
        this.resizeObserver = new ResizeObserver(this.resizeCallback);

        this.intersectionObserver = new IntersectionObserver(this.intersectCallback, {
            rootMargin: this.options.margin.map(v => v + "px").join(" "),
            threshold: [0.99999]
        });
    }

    public override update(popup: HTMLElement, anchor: HTMLElement): void | Promise<void> {
        if (this.popup && this.popup !== popup) {
            this.resizeObserver.unobserve(this.popup);
            this.intersectionObserver.unobserve(this.popup);
        }

        this.anchor = anchor;
        this.popup = popup;
    }

    public override toggle(visibility: boolean): void | Promise<void> {
        if (this.popup && this.anchor) {
            if (visibility) {
                this.maxHeight = this.popup.style.maxHeight;
                this.maxWidth = this.popup.style.maxWidth;
                this.resizeObserver.observe(this.popup);
                this.intersectionObserver.observe(this.popup);
            }
            else {
                this.resizeObserver.unobserve(this.popup);
                this.intersectionObserver.unobserve(this.popup);
                this.popup.style.maxHeight = this.maxHeight;
                this.popup.style.maxWidth = this.maxWidth;
            }
        }
    }

    public override destroy(): void {
        this.resizeObserver.disconnect();
        this.intersectionObserver.disconnect();
    }

    resizeCallback = ([{ target, borderBoxSize: [{ blockSize, inlineSize }] }]: ResizeObserverEntry[]) => {
        // Reposition target only when it is visible
        const element = <HTMLElement>target;
        if (blockSize > 0 && inlineSize > 0) {
            const { flip, margin } = this.options;
            const size: Size = { width: inlineSize, height: blockSize };
            const anchorRect = this.anchor!.getBoundingClientRect();
            const rootBounds = getViewportRect(margin);
            const placement = this.placement === "auto" ? getOptimalPlacement(anchorRect, rootBounds) : this.placement;
            let point = positions[placement](size, anchorRect, this.options);
            if (flip && this.placement !== "auto") {
                // Check whether desired placement provides 100% visibility 
                let ratio = getIntersectionRatio({ ...point, ...size }, rootBounds);
                if (ratio < 1) {
                    // partial intersection with view-port detected, so try to compute 
                    // foptimal fallback placements allowed by options.flip setting
                    const placements = getFallbackPlacements(placement, flip);

                    // compute the best intersecting placement
                    for (const i in placements) {
                        const p = positions[placements[i]](size, anchorRect, this.options);
                        const r = getIntersectionRatio({ ...p, ...size }, rootBounds);
                        if (r > ratio) {
                            ratio = r;
                            point = p;
                        }
                    }
                }
            }

            element.style.position = "fixed";
            element.style.inset = `${Math.round(point.y)}px auto auto ${Math.round(point.x)}px`;
        }
    }

    intersectCallback = ([{ isIntersecting, target, boundingClientRect: r, intersectionRect: ir }]: IntersectionObserverEntry[]) => {
        if (!isIntersecting && target.checkVisibility()) {
            const element = <HTMLElement>target;
            const resize = this.options.resize;

            if (resize === "height" || resize == true) {
                if (this.placement === "left-center" || this.placement === "right-center") {
                    const maxOverflow = Math.max((ir.top - r.top), (r.bottom - ir.bottom), 0);
                    element.style.maxHeight = `${Math.round(r.height - 2 * maxOverflow)}px`;
                } else {
                    element.style.maxHeight = `${Math.round(ir.height)}px`;
                }
            }

            if (resize === "width" || resize === true) {
                if (this.placement === "top-center" || this.placement === "bottom-center") {
                    const maxOverflow = Math.max((ir.left - r.left), (r.right - ir.right), 0);
                    element.style.maxWidth = `${Math.round(r.width - 2 * maxOverflow)}px`;
                } else {
                    element.style.maxWidth = `${Math.round(ir.width)}px`;
                }
            }
        }
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
