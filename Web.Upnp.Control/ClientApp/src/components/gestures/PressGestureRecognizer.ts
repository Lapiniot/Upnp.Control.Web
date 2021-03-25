import { GestureRecognizer } from "./GestureRecognizer";

export type PressGestures = "press" | "release";

export class PressGestureRecognizer<TElement extends HTMLElement> extends GestureRecognizer<TElement, PressGestures, number> {

    protected onPointerDownEvent(event: PointerEvent) {
        super.onPointerDownEvent(event);
        window.requestAnimationFrame(() => {
            this.handler("press", 0);
        });
    }

    protected onPointerUpEvent(event: PointerEvent) {
        super.onPointerUpEvent(event);
        window.requestAnimationFrame(() => this.handler("release", event.timeStamp - this.startTime));
    }
}