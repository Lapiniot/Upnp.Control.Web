export type GestureHandler<TElement extends HTMLElement, TGesture extends string, TParams = undefined> =
    (target: TElement, gesture: TGesture, params: TParams) => void;

export abstract class GestureRecognizer<TElement extends HTMLElement, TGesture extends string, TParams extends unknown> {
    protected handler: GestureHandler<TElement, TGesture, TParams>;
    protected target: TElement | null = null;
    protected startX: number = 0;
    protected startY: number = 0;
    protected startTime: number = 0;
    private updatePending: any;
    private options: AddEventListenerOptions;

    constructor(handler: GestureHandler<TElement, TGesture, TParams>, passive: boolean = true) {
        this.handler = handler;
        this.options = { capture: true, passive: passive };
    }

    public bind(target: TElement) {
        this.unbind();
        this.target = target;
        this.target.addEventListener("pointerdown", this.pointerDownEventHandler, this.options);
        this.updatePending = false;
    }

    public unbind() {
        if (this.target) {
            this.target.removeEventListener("pointerdown", this.pointerDownEventHandler, this.options);
            this.target.removeEventListener("pointerup", this.pointerUpEventHandler, this.options);
            this.target.removeEventListener("pointermove", this.pointerMoveEventHandler, this.options);
        }
        this.target = null;
    }

    private pointerDownEventHandler = (event: PointerEvent) => this.onPointerDownEvent(event);

    private pointerUpEventHandler = (event: PointerEvent) => this.onPointerUpEvent(event);

    private pointerMoveEventHandler = (event: PointerEvent) => this.onPointerMoveEvent(event);

    private wrap(callback: () => void) {
        return () => {
            if (!this.updatePending)
                return;
            try {
                callback();
            } finally {
                this.updatePending = false;
            }
        }
    }

    private updateInternal = this.wrap(() => this.update())

    protected onPointerDownEvent(event: PointerEvent) {
        const target = this.target;

        if (!target) {
            return;
        }

        target.addEventListener("pointerup", this.pointerUpEventHandler, this.options);
        target.addEventListener("pointermove", this.pointerMoveEventHandler, this.options);

        this.startX = event.clientX;
        this.startY = event.clientY;
        this.startTime = event.timeStamp;
    }

    protected onPointerUpEvent(event: PointerEvent) {
        const target = this.target;

        if (!target) {
            return;
        }

        target.removeEventListener("pointerup", this.pointerUpEventHandler, this.options);
        target.removeEventListener("pointermove", this.pointerMoveEventHandler, this.options);
    }

    protected onPointerMoveEvent(_event: PointerEvent) { }

    protected scheduleUpdate = (callback?: () => void) => {
        if (this.updatePending)
            return;

        this.updatePending = true;

        window.requestAnimationFrame(callback ? this.wrap(callback) : this.updateInternal);
    }

    protected update() { }
}

export default GestureRecognizer;