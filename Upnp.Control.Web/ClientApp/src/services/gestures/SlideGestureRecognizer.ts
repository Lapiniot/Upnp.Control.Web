import { GestureHandler, GestureRecognizer } from "./GestureRecognizer";

export type { GestureHandler };

export type SlideParams = {
    phase: "start" | "move" | "end",
    x: number,
    y: number
}

export class SlideGestureRecognizer<TElement extends HTMLElement = HTMLElement> extends GestureRecognizer<TElement, "slide", SlideParams> {
    x: number = 0;
    y: number = 0;

    constructor(handler: GestureHandler<TElement, "slide", SlideParams>, capture = false) {
        super(handler, capture, true);
    }

    protected override onPointerDown(event: PointerEvent) {
        const { target, clientX, clientY, pointerId } = event;
        const element = target as TElement;
        if (this.handler(element, "slide", { phase: "start", x: clientX, y: clientY }) !== false) {
            element.setPointerCapture(pointerId);
            super.onPointerDown(event);
        }
    }

    protected override onPointerUp(event: PointerEvent) {
        const { target, clientX, clientY, pointerId } = event;
        const element = target as TElement;
        element.releasePointerCapture(pointerId);
        super.onPointerUp(event);
        requestAnimationFrame(() => this.handler(element, "slide", { phase: "end", x: clientX, y: clientY }));
    }

    protected override onPointerCancel(event: PointerEvent) {
        (<HTMLElement>event.target).releasePointerCapture(event.pointerId);
    }

    protected override onPointerMoveEvent(event: PointerEvent) {
        super.onPointerMoveEvent(event);
        this.x = event.clientX;
        this.y = event.clientY;
        this.scheduleUpdate();
    }

    protected override update() {
        if (this.target) {
            this.handler(this.target as TElement, "slide", { phase: "move", x: this.x, y: this.y });
        }
    }
}