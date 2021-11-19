declare global {
    interface FetchEvent {
        readonly preloadResponse: Promise<Response | undefined>
    }
}

export { }