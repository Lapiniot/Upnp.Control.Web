import { GestureHandler, GestureRecognizer, PointerType } from "./GestureRecognizer";

export type { GestureHandler };

export class PressHoldGestureRecognizer<TElement extends HTMLElement = HTMLElement> extends GestureRecognizer<TElement, "hold", undefined> {
    delay: number;
    timeout: number | null = null;
    tolerance: number;
    predicate: (e: PointerEvent) => boolean;

    constructor(handler: GestureHandler<TElement, "hold", undefined>, delay = 500, tolerance = 5, pointerType = PointerType.Primary) {
        super(handler, true, true);
        this.delay = delay;
        this.tolerance = tolerance;
        this.predicate = GestureRecognizer.buildPointerTypePredicate(pointerType);
    }

    protected override onPointerDownEvent(event: PointerEvent) {
        if (!this.predicate(event)) return;
        super.onPointerDownEvent(event);
        this.reset();
        this.timeout = window.setTimeout(() => this.handler(this.target as TElement, "hold", undefined), this.delay);
    }

    protected override onPointerMoveEvent(event: PointerEvent) {
        super.onPointerMoveEvent(event);
        if (Math.abs(event.clientX - this.startX) > this.tolerance ||
            Math.abs(event.clientY - this.startY) > this.tolerance)
            this.reset();
    }

    protected override onPointerUpEvent(event: PointerEvent) {
        super.onPointerUpEvent(event);
        this.reset();
    }

    private reset() {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}