export interface GestureHandler<TElement extends HTMLElement, TGesture extends string, TParams = undefined> {
    (target: TElement, gesture: TGesture, params: TParams): void;
}

export abstract class GestureRecognizer<TElement extends HTMLElement, TGesture extends string, TParams> {
    protected handler: GestureHandler<TElement, TGesture, TParams>;
    protected target: TElement | null = null;
    protected startX: number = 0;
    protected startY: number = 0;
    protected startTime: number = 0;
    private updatePending = false;
    private options: AddEventListenerOptions;
    private readonly pointerDownListener = this.onPointerDownEvent.bind(this);
    private readonly pointerUpListener = this.onPointerUpEvent.bind(this);
    private readonly pointerMoveListener = this.onPointerMoveEvent.bind(this);

    constructor(handler: GestureHandler<TElement, TGesture, TParams>, capture: boolean, passive: boolean) {
        this.handler = handler;
        this.options = { capture: capture, passive: passive };
    }

    public bind(target: TElement) {
        if (target === this.target) return;
        this.unbind();
        this.target = target;
        this.target.addEventListener("pointerdown", this.pointerDownListener, this.options);
        this.updatePending = false;
    }

    public unbind() {
        if (!this.target) return;
        this.target.removeEventListener("pointerdown", this.pointerDownListener, this.options);
        this.target.removeEventListener("pointerup", this.pointerUpListener, this.options);
        this.target.removeEventListener("pointermove", this.pointerMoveListener, this.options);
        this.target = null;
    }

    private updateInternal = () => {
        if (!this.updatePending) return;
        try {
            this.update();
        } finally {
            this.updatePending = false;
        }
    }

    protected onPointerDownEvent(event: PointerEvent) {
        const target = <TElement>event.currentTarget;

        target.addEventListener("pointerup", this.pointerUpListener, this.options);
        target.addEventListener("pointermove", this.pointerMoveListener, this.options);

        this.startX = event.clientX;
        this.startY = event.clientY;
        this.startTime = event.timeStamp;
    }

    protected onPointerUpEvent(event: PointerEvent) {
        const target = <TElement>event.currentTarget;

        target.removeEventListener("pointerup", this.pointerUpListener, this.options);
        target.removeEventListener("pointermove", this.pointerMoveListener, this.options);
    }

    protected onPointerMoveEvent(_: PointerEvent) { }

    protected scheduleUpdate = () => {
        if (this.updatePending) return;

        this.updatePending = true;

        requestAnimationFrame(this.updateInternal);
    }

    protected update() { }
}