/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { formatTrackInfoLine, viaProxy } from "./components/Extensions";
import { AVState, DeviceDescription, NotificationType, UpnpDevice } from "./routes/common/Types";
import { UpnpDeviceTools as UDT } from "./routes/common/UpnpDeviceTools";

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
    .concat(["icons.svg", "icon.svg", "sprites.svg", "favicon.ico", "manifest.webmanifest",
        "192.png", "512.png", "apple-touch-icon.png"]);

const CACHES = [CACHE_STORE_NAME];

// Navigation requests to the urls starting with any of this 
// prefixes will be skipped from fetch by this worker
const BLACKLIST_PREFIXES = ["/api"];

async function precache() {
    try {
        const cache = await caches.open(CACHE_STORE_NAME);
        await cache.addAll(CACHE_STORE_ITEMS);
    } catch (error) {
        console.error(`error precaching static content: ${error}`);
    }
}

async function cleanup() {
    const keys = (await caches.keys()).filter(k => !CACHES.includes(k));
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
    if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
        console.info("navigation preload has beeen enabled");
    }
}

async function fetchWithPreload(event: FetchEvent): Promise<Response> {
    if ("preloadResponse" in event) {
        var response = await event.preloadResponse;
        if (response) {
            return response;
        }
    }

    return await fetch(event.request);
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

    const r = event.request;

    if (r.mode === "navigate" || r.destination !== "") {

        const url = new URL(r.url);
        url.search = "";
        if (BLACKLIST_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) {
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
                const response = await cacheResponse;
                if (response.ok) {
                    await cache.put(key, response);
                }
            })());

            return await caches.match(key) ?? networkResponse;
        })());
    }
})

self.addEventListener("push", event => {
    const data = event.data?.json();

    if (!("type" in data)) return;

    const type: NotificationType = data.type;

    if ((type === "appeared" || type === "disappeared") && "device" in data) {

        const device = data.device as UpnpDevice;
        const title = `UPnP discovery: ${device.name}`;
        const icon = UDT.getOptimalIcon(device.icons, 192);
        const category = UDT.getCategory(device);

        const options: NotificationOptions = type === "appeared" ? {
            body: `'${device.description}' has appeared on the network`,
            icon: icon ? viaProxy(icon.url) : UDT.getFallbackIcon(device.type),
            data: { url: `/${category}/${device.udn}` },
            tag: "discovery"
        } : {
            body: `'${device.description}' has disappeared from the network`,
            icon: `/${UDT.getFallbackIcon(device.type)}`,
            data: { url: `/${category}` },
            tag: "discovery"
        };

        event.waitUntil(showNotification(title, options));
    } else if (type === "av-state" && "state" in data && "device" in data) {
        const state: AVState = data.state;
        const { udn, description } = data.device as DeviceDescription;
        const title = `\u00AB${description}\u00BB now playing`;
        const { artists, creator, album, date, title: track } = state.current ?? {};
        const uri: string = data.vendorProps?.["mi:playlist_transport_uri"];
        const url = uri ? `/umi/${udn}/playlists/PL:${uri.substr(uri.lastIndexOf("=") + 1)}` : `/renderers/${udn}`;

        const options: NotificationOptions = {
            body: `${track}\n${formatTrackInfoLine(artists?.[0] ?? creator, album, date)}`,
            data: { url },
            tag: "av-state"
        };

        event.waitUntil(showNotification(title, options));
    }
})

function showNotification(title: string, options: NotificationOptions) {
    return self.registration.getNotifications({ "tag": options.tag })
        .then(notifications => notifications.forEach(n => n.close()))
        .then(() => self.registration.showNotification(title, options));
}

self.addEventListener("notificationclick", event => {
    const relativeUrl = event.notification.data?.url;
    if (relativeUrl) {
        const url = new URL(relativeUrl, self.origin).href;
        event.waitUntil((async () => {
            const clients = await self.clients.matchAll({ type: "window" });
            if (clients.length) {
                const client = clients[0];
                client.focus();
                if (client.url !== url) {
                    client.navigate(url);
                }
            }
            else {
                self.clients.openWindow(url);
            }
            event.notification.close();
        })());
    }
})

export { }

