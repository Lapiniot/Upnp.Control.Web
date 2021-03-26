import { GestureHandler, GestureRecognizer } from "./GestureRecognizer";

export type SwipeGestures = "swipe-left" | "swipe-right" | "swipe-up" | "swipe-down";

export class SwipeGestureRecognizer<TElement extends HTMLElement> extends GestureRecognizer<TElement, SwipeGestures, undefined> {

    delta: number;
    dtime: number;
    endX: number = 0;
    endY: number = 0;
    endTime: number = 0;

    constructor(handler: GestureHandler<TElement, SwipeGestures, undefined>, delta: number = 50, time: number = 1000) {
        super(handler);
        this.delta = delta;
        this.dtime = time;
    }

    protected onPointerUpEvent(event: PointerEvent) {
        super.onPointerUpEvent(event);

        this.endX = event.clientX;
        this.endY = event.clientY;
        this.endTime = event.timeStamp;

        this.scheduleUpdate();
    }

    protected update() {
        const dx = this.endX - this.startX, dy = this.endY - this.startY;
        const dxAbs = Math.abs(dx), dyAbs = Math.abs(dy);
        const dt = this.endTime - this.startTime;

        if (dxAbs > dyAbs) {
            if (dxAbs > this.delta && dt < this.dtime) {
                this.handler(this.target as TElement, Math.sign(dx) === 1 ? "swipe-right" : "swipe-left", undefined);
            }
        } else {
            if (dyAbs > this.delta && dt < this.dtime) {
                this.handler(this.target as TElement, Math.sign(dy) === 1 ? "swipe-down" : "swipe-up", undefined);
            }
        }
    }
}