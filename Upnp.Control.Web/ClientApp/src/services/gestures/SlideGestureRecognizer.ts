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

    constructor(handler: GestureHandler<TElement, "slide", SlideParams>) {
        super(handler, true, false);
    }

    protected override onPointerDownEvent(event: PointerEvent) {
        const { currentTarget, clientX, clientY, pointerId } = event;
        const element = currentTarget as TElement;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        element.setPointerCapture(pointerId);
        super.onPointerDownEvent(event);

        requestAnimationFrame(() => {
            var r = element.getBoundingClientRect();
            this.handler(element, "slide", { phase: "start", x: clientX - r.x, y: clientY - r.y })
        });
    }

    protected override onPointerUpEvent(event: PointerEvent) {
        const { currentTarget, clientX, clientY, pointerId } = event;
        const element = currentTarget as TElement;

        event.preventDefault();
        element.releasePointerCapture(pointerId);
        super.onPointerUpEvent(event);

        requestAnimationFrame(() => {
            var r = element.getBoundingClientRect();
            this.handler(element, "slide", { phase: "end", x: clientX - r.x, y: clientY - r.y })
        });
    }

    protected override onPointerMoveEvent(event: PointerEvent) {
        event.preventDefault();
        super.onPointerMoveEvent(event);
        this.x = event.clientX;
        this.y = event.clientY;
        this.scheduleUpdate();
    }

    protected override update() {
        if (this.target) {
            var r = this.target.getBoundingClientRect();
            this.handler(this.target as TElement, "slide", { phase: "move", x: this.x - r.x, y: this.y - r.y });
        }
    }
}