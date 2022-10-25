export interface GestureHandler<TElement extends HTMLElement, TGesture extends string, TParams = undefined> {
    (target: TElement, gesture: TGesture, params: TParams): void;
}

export enum PointerType {
    Touch = 0x1,
    LButton = 0x2,
    RButton = 0x4,
    Primary = Touch | LButton,
    Any = Touch | LButton | RButton
}

export abstract class GestureRecognizer<TElement extends HTMLElement, TGesture extends string, TParams extends unknown> {
    protected handler: GestureHandler<TElement, TGesture, TParams>;
    protected target: TElement | null = null;
    protected startX: number = 0;
    protected startY: number = 0;
    protected startTime: number = 0;
    private updatePending: any;
    private options: AddEventListenerOptions;
    private readonly pointerDownEventListener = this.onPointerDownEvent.bind(this);
    private readonly pointerUpEventListener = this.onPointerUpEvent.bind(this);
    private readonly pointerMoveEventListener = this.onPointerMoveEvent.bind(this);

    constructor(handler: GestureHandler<TElement, TGesture, TParams>, capture: boolean, passive: boolean) {
        this.handler = handler;
        this.options = { capture: capture, passive: passive };
    }

    public bind(target: TElement) {
        if (target === this.target) return;
        this.unbind();
        this.target = target;
        this.target.addEventListener("pointerdown", this.pointerDownEventListener, this.options);
        this.updatePending = false;
    }

    public unbind() {
        if (this.target) {
            this.target.removeEventListener("pointerdown", this.pointerDownEventListener, this.options);
            this.target.removeEventListener("pointerup", this.pointerUpEventListener, this.options);
            this.target.removeEventListener("pointermove", this.pointerMoveEventListener, this.options);
        }
        this.target = null;
    }

    private updateInternal = () => {
        if (!this.updatePending)
            return;
        try {
            this.update();
        } finally {
            this.updatePending = false;
        }
    }

    protected onPointerDownEvent(event: PointerEvent) {
        const target = this.target;

        if (!target) {
            return;
        }

        target.addEventListener("pointerup", this.pointerUpEventListener, this.options);
        target.addEventListener("pointermove", this.pointerMoveEventListener, this.options);

        this.startX = event.clientX;
        this.startY = event.clientY;
        this.startTime = event.timeStamp;
    }

    protected onPointerUpEvent(_: PointerEvent) {
        const target = this.target;

        if (!target) {
            return;
        }

        target.removeEventListener("pointerup", this.pointerUpEventListener, this.options);
        target.removeEventListener("pointermove", this.pointerMoveEventListener, this.options);
    }

    protected onPointerMoveEvent(_: PointerEvent) { }

    protected scheduleUpdate = () => {
        if (this.updatePending)
            return;

        this.updatePending = true;

        requestAnimationFrame(this.updateInternal);
    }

    protected update() { }

    protected static buildPointerTypePredicate(pointerType: PointerType): (event: PointerEvent) => boolean {
        let predicate: (e: PointerEvent) => boolean = () => false;
        if (pointerType & PointerType.LButton) {
            const prev = predicate;
            predicate = (e) => prev(e) || e.pointerType === "mouse" && e.button === 0;
        }
        if (pointerType & PointerType.RButton) {
            const prev = predicate;
            predicate = (e) => prev(e) || e.pointerType === "mouse" && e.button === 2;
        }
        if (pointerType & PointerType.Touch) {
            const prev = predicate;
            predicate = (e) => prev(e) || e.pointerType === "touch";
        }
        return predicate;
    }
}