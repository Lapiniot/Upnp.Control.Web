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
        const { currentTarget, clientX, clientY } = event;
        const element = currentTarget as HTMLElement;

        var r = element.getBoundingClientRect();
        if (clientX < r.left || clientX > r.right ||
            clientY < r.top || clientY > r.bottom) {
            return;
        }

        super.onPointerDownEvent(event);

        this.x = (clientX - r.x);
        this.y = (clientY - r.y);

        this.scheduleUpdate(() => this.handler(this.target as TElement, "slide", { phase: "start", x: this.x, y: this.y }));
    }

    protected onPointerUpEvent(event: PointerEvent) {
        event.preventDefault();
        super.onPointerUpEvent(event);
        this.x = event.offsetX;
        this.y = event.offsetY;
        this.scheduleUpdate(() => this.handler(this.target as TElement, "slide", { phase: "end", x: this.x, y: this.y }));
    }

    protected onPointerMoveEvent(event: PointerEvent) {
        event.preventDefault();
        super.onPointerMoveEvent(event);
        this.x = event.offsetX;
        this.y = event.offsetY;
        this.scheduleUpdate();
    }

    protected update() {
        this.handler(this.target as TElement, "slide", { phase: "move", x: this.x, y: this.y });
    }
}