import { GestureHandler, GestureRecognizer } from "./GestureRecognizer";


export class PressHoldGestureRecognizer<TElement extends HTMLElement> extends GestureRecognizer<TElement, "hold", undefined> {
    delay: number;
    timeout: number | null = null;
    tolerance = 10;

    constructor(handler: GestureHandler<"hold", undefined>, delay: number = 750) {
        super(handler);
        this.delay = delay;
    }

    protected onPointerDownEvent(event: PointerEvent) {
        super.onPointerDownEvent(event);
        this.timeout = window.setTimeout(() => this.handler("hold", undefined), this.delay);
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