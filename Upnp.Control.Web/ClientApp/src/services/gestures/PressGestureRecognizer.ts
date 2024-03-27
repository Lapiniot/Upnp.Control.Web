import { GestureHandler, GestureRecognizer } from "./GestureRecognizer";

export type { GestureHandler };

export type PressGestures = "press" | "release";

export class PressGestureRecognizer<TElement extends HTMLElement = HTMLElement> extends GestureRecognizer<TElement, PressGestures, number> {

    protected override onPointerDown(event: PointerEvent) {
        super.onPointerDown(event);
        requestAnimationFrame(() => this.handler(event.target as TElement, "press", 0));
    }

    protected override onPointerUp(event: PointerEvent) {
        super.onPointerUp(event);
        requestAnimationFrame(() => this.handler(event.target as TElement, "release", event.timeStamp - this.startTime));
    }
}