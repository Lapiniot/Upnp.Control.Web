declare global {
    type ResizeObserverBoxOptions = "border-box" | "content-box" | "device-pixel-content-box"

    interface ResizeObserverOptions { box?: ResizeObserverBoxOptions }

    interface ResizeObserverSize {
        readonly inlineSize: number;
        readonly blockSize: number;
    }

    interface ResizeObserver {
        disconnect: () => void;
        observe: (target: HTMLOrSVGElement, options?: ResizeObserverOptions) => void;
        unobserve: (target: HTMLOrSVGElement) => void;
    }

    interface ResizeObserverEntry {
        target: Element;
        contentRect: DOMRectReadOnly;
        borderBoxSize: ReadonlyArray<ResizeObserverSize>;
        contentBoxSize: ReadonlyArray<ResizeObserverSize>;
        devicePixelContentBoxSize: ReadonlyArray<ResizeObserverSize>;
    }

    interface ResizeObserverCallback { (entries: ResizeObserverEntry[], observer: ResizeObserver): void }

    var ResizeObserver: {
        prototype: ResizeObserver;
        new(handler: ResizeObserverCallback): ResizeObserver;
    }
}

export { }