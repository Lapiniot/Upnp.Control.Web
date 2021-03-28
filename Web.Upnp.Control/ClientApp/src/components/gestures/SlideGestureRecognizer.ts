import { GestureHandler, GestureRecognizer } from "./GestureRecognizer";

export type SlideParams = {
    phase: "start" | "move" | "end";
    x: number;
    y: number;
};

export class SlideGestureRecognizer<TElement extends HTMLElement> extends GestureRecognizer<TElement, "slide", SlideParams> {
    x: number = 0;
    y: number = 0;
    constructor(handler: GestureHandler<TElement, "slide", SlideParams>) {
        super(handler, false);
    }

    protected onPointerDownEvent(event: PointerEvent) {
        const { currentTarget, clientX, clientY, pointerId } = event;
        const element = currentTarget as TElement;

        event.preventDefault();
        element.setPointerCapture(pointerId);
        super.onPointerDownEvent(event);

        this.scheduleUpdate(() => {
            var r = element.getBoundingClientRect();
            this.handler(element, "slide", { phase: "start", x: clientX - r.x, y: clientY - r.y })
        });
    }

    protected onPointerUpEvent(event: PointerEvent) {
        const { currentTarget, clientX, clientY, pointerId } = event;
        const element = currentTarget as TElement;

        event.preventDefault();
        element.releasePointerCapture(pointerId);
        super.onPointerUpEvent(event);

        this.scheduleUpdate(() => {
            var r = element.getBoundingClientRect();
            this.handler(element, "slide", { phase: "end", x: clientX - r.x, y: clientY - r.y })
        });
    }

    protected onPointerMoveEvent(event: PointerEvent) {
        event.preventDefault();
        super.onPointerMoveEvent(event);
        this.x = event.clientX;
        this.y = event.clientY;
        this.scheduleUpdate();
    }

    protected update() {
        if (this.target) {
            var r = this.target.getBoundingClientRect();
            this.handler(this.target as TElement, "slide", { phase: "move", x: this.x - r.x, y: this.y - r.y });
        }
    }
}