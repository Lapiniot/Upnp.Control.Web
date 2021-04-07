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

const CACHE_STORE_ITEMS = self.__WB_MANIFEST
    .map(e => typeof e === "string" ? e : e.url)
    .concat(["icons.svg", "icon.svg", "favicon.ico", "manifest.webmanifest",
        "192.png", "512.png", "apple-touch-icon.png"]);

const CACHES = [CACHE_STORE_NAME];

// Navigation requests to the urls starting with any of this 
// prefixes will be skipped from fetch by this worker
const BLACKLIST_PREFIXES = ["/api"];

async function precache() {
    try {
        console.info("precaching static content:");
        console.debug(CACHE_STORE_ITEMS);
        const cache = await caches.open(CACHE_STORE_NAME);
        await cache.addAll(CACHE_STORE_ITEMS);
    } catch (error) {
        console.error(`error precaching static content: ${error}`);
    }
}

async function cleanup() {
    const keys = (await caches.keys()).filter(k => !CACHES.includes(k));
    console.debug(`obsolete caches to be removed: ${keys}`);
    for (const key of keys) {
        try {
            await caches.delete(key);
        } catch (error) {
            console.error(`error purging obsolete cache ${key}: ${error}`);
        }
    }
}

async function enablePreload() {
    // Enable navigation preload if it's supported.
    // See https://developers.google.com/web/updates/2017/02/navigation-preload
    if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
        console.info("navigation preload has beeen enabled");
    }
}

async function fetchWithPreload(event: FetchEvent): Promise<Response> {
    const response = await Promise.resolve<Response>(event.preloadResponse);
    if (response) {
        console.debug(`received preload response for ${event.request.url}`);
        return response;
    }
    else {
        console.debug(`no preload response for ${event.request.url}, using regular fetch`);
        return await fetch(event.request);
    }
}

self.addEventListener("install", event => {
    console.info("installing service worker...");
    event.waitUntil(precache());
    self.skipWaiting();
})

self.addEventListener("activate", event => {
    console.info("activating service worker...");
    event.waitUntil(Promise.all([
        cleanup(),
        enablePreload()
    ]));
    self.clients.claim();
})

self.addEventListener("fetch", event => {

    console.debug(event.request);
    const r = event.request;

    if (r.mode === "navigate" || r.destination !== "") {

        const url = new URL(r.url);
        url.search = "";
        if (BLACKLIST_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) {
            console.debug(`${url.href} is blacklisted by this service worker, allowing regular fetch to proceed`);
            return;
        }

        event.respondWith((async () => {
            if (r.mode === "navigate") {
                // forward all navigation requests to tha main AppShell page
                url.pathname = "index.html";
            }

            const key = url.toString();

            const networkResponse = fetchWithPreload(event);
            const cacheResponse = networkResponse.then(r => r.clone());

            event.waitUntil((async () => {
                const cache = await caches.open(CACHE_STORE_NAME);
                try {
                    const response = await cacheResponse;
                    if (response.ok) {
                        console.debug(`updating cache content for ${key}`);
                        await cache.put(key, response);
                    }
                    else {
                        console.debug(`Request failed for ${key}: ${response.statusText}. Keeping currently cached item intact.`);
                    }
                }
                catch (error) {
                    console.debug(`network request failed for ${key}, cached content will stay intact`);
                }
            })());

            const cached = await caches.match(key);
            if (cached) {
                console.debug(`serving content from the cache for ${key}`);
                return cached;
            }
            else {
                console.debug(`cache miss for ${key}, waiting for network response is ready`);
                return networkResponse;
            }
        })());
    }
})

self.addEventListener("push", event => {
    const data = event.data?.text() ?? "Some Push Message";
    console.log(data);
    event.waitUntil(self.registration.showNotification(data));
})

export { }