import { GestureRecognizer } from "./GestureRecognizer";

export type PressGestures = "press" | "release";

export class PressGestureRecognizer<TElement extends HTMLElement> extends GestureRecognizer<TElement, PressGestures, number> {

    protected onPointerDownEvent(event: PointerEvent) {
        super.onPointerDownEvent(event);
        requestAnimationFrame(() => this.handler(this.target as TElement, "press", 0));
    }

    protected onPointerUpEvent(event: PointerEvent) {
        super.onPointerUpEvent(event);
        requestAnimationFrame(() => this.handler(this.target as TElement, "release", event.timeStamp - this.startTime));
    }
}