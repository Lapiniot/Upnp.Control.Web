export { }

interface ResizeObserver {
}

declare global {
    var ResizeObserver: {
        prototype: ResizeObserver;
        new(): ResizeObserver;
    }
}