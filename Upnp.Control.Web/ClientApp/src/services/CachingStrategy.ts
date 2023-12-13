export interface ICachingStrategy {
    apply(event: FetchEvent, options: unknown): void;
}

abstract class UseCacheStrategy implements ICachingStrategy {
    cacheName: string;

    constructor(cacheName: string) {
        if (!cacheName) {
            throw new Error("Cache name must be provided.");
        }
        this.cacheName = cacheName;
    }

    abstract apply(event: FetchEvent, options: unknown): void;

    protected fetchAndCache(request: RequestInfo | URL, cache: Cache) {
        return fetch(request).then(response => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
    }
}

export class StaleWhileRevalidateStrategy extends UseCacheStrategy {
    constructor(cacheName: string) {
        super(cacheName);
    }

    apply(event: FetchEvent) {
        const request = event.request;
        event.respondWith(caches.open(this.cacheName).then(
            cache => cache.match(request).then(cacheResponse => {
                const networkResponse = this.fetchAndCache(request, cache);
                return cacheResponse ?? networkResponse;
            })
        ))
    }
}

export class CacheOnlyStrategy extends UseCacheStrategy {
    constructor(cacheName: string) {
        super(cacheName);
    }

    apply(event: FetchEvent, options?: { key: string | URL }) {
        const request = options?.key ?? event.request;
        event.respondWith(caches.open(this.cacheName).then(
            cache => cache.match(request).then(cacheResponse => {
                if (!cacheResponse) {
                    throw new Error(`Failed to get response from the cache for '${request instanceof Request ? request.url : request}'`);
                }
                return cacheResponse;
            })
        ))
    }
}

export class CacheFirstStrategy extends UseCacheStrategy {
    constructor(cacheName: string) {
        super(cacheName);
    }

    apply(event: FetchEvent, options?: { key: string | URL }) {
        const request = options?.key ?? event.request;
        event.respondWith(caches.open(this.cacheName).then(
            cache => cache.match(request).then(cacheResponse => {
                return cacheResponse ?? this.fetchAndCache(request, cache);
            })
        ))
    }
}