/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

interface PrecacheEntry {
    integrity?: string;
    url: string;
    revision?: string;
}

declare global {
    export interface WorkerGlobalScope {
        __WB_MANIFEST: Array<PrecacheEntry | string>;
    }
}

declare const self: ServiceWorkerGlobalScope;

const CACHE_STORE_NAME = "upnp-dashboard-store";

async function precache() {
    try {
        const entries = self.__WB_MANIFEST;
        console.log(entries);
        const cache = await caches.open(CACHE_STORE_NAME);
        entries.forEach(e => {
            cache.add(new Request(typeof e === "string" ? e : e.url, { cache: "reload" }));
        });
        console.info("succesfully installed service worker");
    } catch (error) {
        console.error(`error installing service worker: ${error}`);
        throw error;
    }
}

async function enablePreload() {
    // Enable navigation preload if it's supported.
    // See https://developers.google.com/web/updates/2017/02/navigation-preload
    if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
    }
}

function normalizeUrl(originalUrl: string): string {
    const url = new URL(originalUrl);
    url.search = "";
    return url.toString();
}

async function fetchWithPreload(event: FetchEvent) {
    const response = await Promise.resolve(event.preloadResponse);
    if (response) {
        console.info(`received preload response for ${event.request.url}`);
        return response;
    }
    else {
        console.info(`no preload response for ${event.request.url}, using regular fetch`);
        return await fetch(event.request);
    }
}

self.addEventListener("install", event => {
    console.info("installing service worker...");
    event.waitUntil(precache());
    self.skipWaiting();
})

self.addEventListener("activate", event => {
    console.info("activating service worker");
    event.waitUntil(enablePreload());
    self.clients.claim();
})

self.addEventListener("fetch", event => {
    if (event.request.mode === "navigate") {
        event.respondWith((async () => {
            try {
                const preloadResponse = await event.preloadResponse;
                if (preloadResponse) {
                    return preloadResponse;
                }
            } catch (error) { }

            const url = normalizeUrl(event.request.url);
            const networkResponse = fetchWithPreload(event);
            const cacheResponse = networkResponse.then(r => r.clone());

            event.waitUntil((async () => {
                const cache = await caches.open(CACHE_STORE_NAME);
                console.info(`updating cache for ${url}`);
                await cache.put(url, await cacheResponse);
            })());

            return await caches.match(url) ?? networkResponse;
        })());
    }
})

export { }