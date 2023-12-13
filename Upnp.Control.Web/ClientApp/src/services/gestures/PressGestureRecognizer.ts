import { GestureHandler, GestureRecognizer } from "./GestureRecognizer";

export type { GestureHandler };

export type PressGestures = "press" | "release";

export class PressGestureRecognizer<TElement extends HTMLElement = HTMLElement> extends GestureRecognizer<TElement, PressGestures, number> {

    protected override onPointerDownEvent(event: PointerEvent) {
        super.onPointerDownEvent(event);
        requestAnimationFrame(() => this.handler(this.target as TElement, "press", 0));
    }

    protected override onPointerUpEvent(event: PointerEvent) {
        super.onPointerUpEvent(event);
        requestAnimationFrame(() => this.handler(this.target as TElement, "release", event.timeStamp - this.startTime));
    }
}