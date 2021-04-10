import { GestureHandler, GestureRecognizer } from "./GestureRecognizer";

export class PressHoldGestureRecognizer<TElement extends HTMLElement> extends GestureRecognizer<TElement, "hold", undefined> {
    delay: number;
    timeout: number | null = null;
    tolerance: number;

    constructor(handler: GestureHandler<TElement, "hold", undefined>, delay = 500, tolerance = 5) {
        super(handler, true, true);
        this.delay = delay;
        this.tolerance = tolerance;
    }

    protected onPointerDownEvent(event: PointerEvent) {
        super.onPointerDownEvent(event);
        this.reset();
        this.timeout = window.setTimeout(() => this.handler(this.target as TElement, "hold", undefined), this.delay);
    }

    protected onPointerMoveEvent(event: PointerEvent) {
        super.onPointerMoveEvent(event);
        if (Math.abs(event.clientX - this.startX) > this.tolerance ||
            Math.abs(event.clientY - this.startY) > this.tolerance)
            this.reset();
    }

    protected onPointerUpEvent(event: PointerEvent) {
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