/// <reference lib="webworker" />

import { CacheFirstStrategy, CacheOnlyStrategy, StaleWhileRevalidateStrategy } from "./services/CachingStrategy";
import { formatTrackInfoLine, viaProxy } from "./services/Extensions";
import { UpnpDeviceTools as UDT } from "./routes/common/UpnpDeviceTools";

declare global {
    export interface WorkerGlobalScope {
        __WB_MANIFEST: Array<string>;
        __BUILD_HASH: string;
    }
}

declare const self: ServiceWorkerGlobalScope

const CACHE_STORE_NAME = "upnp-dashboard-store-" + self.__BUILD_HASH;
const CACHE_STORE_ITEMS = self.__WB_MANIFEST;
const CACHES = [CACHE_STORE_NAME]

const strategies = {
    staleWhileRevalidate: new StaleWhileRevalidateStrategy(CACHE_STORE_NAME),
    cacheOnly: new CacheOnlyStrategy(CACHE_STORE_NAME),
    cacheFirst: new CacheFirstStrategy(CACHE_STORE_NAME)
}

self.addEventListener("install", event => {
    console.info("Installing service worker...");
    event.waitUntil(caches.open(CACHE_STORE_NAME)
        .then(cache => cache.addAll(CACHE_STORE_ITEMS))
        .then(() => console.info(`Items added to the cache ${CACHE_STORE_NAME}: ${CACHE_STORE_ITEMS}`))
        .catch(error => (console.error(`Error precaching static content. ${error}.`), Promise.reject(error))));
    self.skipWaiting();
})

self.addEventListener("activate", event => {
    console.info("Activating service worker...");
    event.waitUntil(Promise.allSettled([
        caches.keys().then(keys => Promise.allSettled(keys.filter(key => !CACHES.includes(key)).map(key => caches.delete(key)
            .then(() => console.info(`Obsolete cache '${key}' has been dropped.`))
            .catch(error => console.error(`Error dropping obsolete cache '${key}'. '${error}'.`))))),
        "navigationPreload" in self.registration
            ? self.registration.navigationPreload.enable()
                .then(() => console.info("Navigation preload has beeen enabled."))
                .catch(error => console.error(`Error enabling navigation preload. ${error}.`))
            : Promise.resolve()
    ]));
    self.clients.claim();
})

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.destination === "") {
        return;
    }

    if (request.mode === "navigate" && request.destination === "document") {
        const url = new URL(request.url);
        if (!url.pathname.startsWith("/api")) {
            strategies.cacheFirst.apply(event, { key: "/index.html" });
        }
        return;
    }

    if (request.destination === "script") {
        strategies.staleWhileRevalidate.apply(event);
        return;
    }

    strategies.cacheFirst.apply(event);
})

self.addEventListener("push", event => {
    const data = event.data?.json();

    if (!("type" in data)) return;

    const type: NotificationType = data.type;

    if ((type === "appeared" || type === "disappeared") && "device" in data) {

        const device = data.device as Upnp.Device;
        const title = `UPnP discovery: ${device.name}`;
        const icon = UDT.getOptimalIcon(device.icons, 192);
        const category = UDT.getCategory(device);

        const options: NotificationOptions = type === "appeared" ? {
            body: `'${device.description}' has appeared on the network`,
            icon: icon ? viaProxy(icon.url) : `stack.svg#${UDT.getSpecialRoleIcon(device.type)}`,
            data: { url: `/${category}/${device.udn}` },
            tag: "discovery"
        } : {
            body: `'${device.description}' has disappeared from the network`,
            icon: `stack.svg#${UDT.getSpecialRoleIcon(device.type)}`,
            data: { url: `/${category}` },
            tag: "discovery"
        };

        event.waitUntil(showNotification(title, options));
    } else if (type === "av-state" && "state" in data && "device" in data) {
        const state = <Upnp.AVState>data.state;
        const { udn, description } = <Upnp.DeviceDescription>data.device;
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