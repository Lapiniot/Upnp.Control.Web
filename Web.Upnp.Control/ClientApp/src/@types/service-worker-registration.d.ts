declare global {
    interface NavigationPreloadManager {
        enable(): Promise<void>,
        disable(): Promise<void>
    }

    interface ServiceWorkerRegistration {
        readonly navigationPreload: NavigationPreloadManager
    }
}

export { }