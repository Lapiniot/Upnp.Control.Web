import { toBase64 } from "./Extensions";
import { HttpFetch, JsonHttpFetch, RequestQuery, HttpPostFetch, HttpPutFetch, HttpDeleteFetch } from "./HttpFetch";

const baseUri = "/api";
const devicesBaseUri = baseUri + "/devices";

type BrowseOptionFlags = "withParents" | "withResourceProps" | "withVendorProps" | "withMetadata" | "withDevice"
export type BrowseOptions = Partial<Record<BrowseOptionFlags, boolean>>
export type ApplicationInfo = {
    build: { version?: string, date?: string },
    product?: string,
    hostName: string,
    addresses: string[]
}

export interface ControlApiClient {
    readonly deviceId: string
    state(detailed?: boolean): JsonHttpFetch<Upnp.AVState>
    play(id?: string, sourceDevice?: string): HttpPutFetch
    playUri(id: string): HttpPutFetch
    pause(): HttpPutFetch
    stop(): HttpPutFetch
    prev(): HttpPutFetch
    next(): HttpPutFetch
    position(detailed?: boolean): JsonHttpFetch<Upnp.AVPosition>
    seek(position: number | string): HttpPutFetch
    setPlayMode(mode: Upnp.PlaybackMode): HttpPutFetch
    volume(detailed?: boolean): JsonHttpFetch<Upnp.RCState>
    setVolume(volume: number): HttpPutFetch
    getMute(): JsonHttpFetch<boolean>
    setMute(mute: boolean): HttpPutFetch
}

export interface PlaylistApiClient {
    readonly deviceId: string
    state(): JsonHttpFetch<Record<string, string>>
    create(title: string): HttpPostFetch
    createFromItems(title: string, sourceDevice: string, sourceIds: string[], maxDepth?: number): HttpPostFetch
    createFromFiles(data: Iterable<File> | FormData, title?: string | null, merge?: boolean, useProxy?: boolean): HttpPostFetch
    rename(id: string, title: string): HttpPutFetch
    delete(ids: string[]): HttpDeleteFetch
    copy(id: string, title: string): HttpPostFetch
    addItems(id: string, sourceDevice: string, sourceIds: string[], maxDepth?: number): HttpPostFetch
    addUrl(id: string, mediaUrl: string, title?: string, useProxy?: boolean): HttpPostFetch
    addFromFiles(id: string, data: Iterable<File> | FormData, useProxy?: boolean): HttpPostFetch
    removeItems(id: string, ids: string[]): HttpDeleteFetch
}

export interface BrowseApiClient {
    readonly deviceId: string;
    get(id?: string): BrowseFetch;
}

export interface QueueApiClient {
    readonly deviceId: string
    enqueue(queueId: string, sourceDevice: string, sourceIds: string[]): HttpPostFetch
    clear(queueId: string): HttpDeleteFetch
}

export const enum PushNotificationType {
    None = 0x0,
    DeviceDiscovery = 0x1,
    PlaybackStateChange = 0x2,
    ContentUpdated = 0x4
}

export interface PushSubscriptionApiClient {
    serverKey(): HttpFetch
    subscribe(endpoint: string, type: PushNotificationType, p256dh: ArrayBuffer | null, auth: ArrayBuffer | null): HttpPostFetch
    unsubscribe(endpoint: string, type: PushNotificationType): HttpDeleteFetch
    subscribed(endpoint: string, type: PushNotificationType): JsonHttpFetch<boolean>
}

export default class WebApi {

    public static devices(category: string): JsonHttpFetch<Upnp.Device[]>

    public static devices(category: string, id: string): JsonHttpFetch<Upnp.Device>

    public static devices(category: string, id?: string) {
        return new JsonHttpFetch<Upnp.Device | Upnp.Device[]>(`${devicesBaseUri}${id ? `/${id}` : ""}${category ? "?category=" + category : ""}`)
    }

    public static browse(deviceId: string): BrowseApiClient {
        return {
            get deviceId() { return deviceId },
            get(id = "") { return new BrowseFetch(`${devicesBaseUri}/${deviceId}/items/${encodeURIComponent(id)}`) }
        }
    }

    public static playlist(deviceId: string): PlaylistApiClient {
        return {
            get deviceId() { return deviceId },
            state() { return new JsonHttpFetch(`${devicesBaseUri}/${deviceId}/playlists/state`) },
            create(title: string) { return new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists`, null, json(title)) },
            createFromItems(title: string, sourceDevice: string, sourceIds: string[], maxDepth?: number) {
                return new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists/items`, null,
                    json({ title, source: { deviceId: sourceDevice, items: sourceIds, maxDepth } }))
            },
            createFromFiles(data: Iterable<File> | FormData, title?: string | null, merge?: boolean, useProxy?: boolean) {
                const url = `${devicesBaseUri}/${deviceId}/playlists/files`;

                if (data instanceof FormData) {
                    return new HttpPostFetch(url, null, { body: data });
                }

                const formData = createFormData(data, useProxy);
                if (title) formData.set("title", title);
                if (merge) formData.set("merge", "true");

                return new HttpPostFetch(url, null, { body: formData });
            },
            rename(id: string, title: string) { return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}`, null, json(title)) },
            delete(ids: string[]) { return new HttpDeleteFetch(`${devicesBaseUri}/${deviceId}/playlists`, null, json(ids)) },
            copy(id: string, title?: string) { return new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/copy`, null, json(title)) },
            addItems(id: string, sourceDevice: string, sourceIds: string[], maxDepth?: number) {
                return new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/items`, null, json({ deviceId: sourceDevice, items: sourceIds, maxDepth }))
            },
            addUrl(id: string, url: string, title?: string, useProxy?: boolean) {
                return new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/feeds`, null, json({ url, title, useProxy }))
            },
            addFromFiles(id: string, data: Iterable<File> | FormData, useProxy?: boolean) {
                return new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/files`, null, { body: data instanceof FormData ? data : createFormData(data, useProxy) })
            },
            removeItems(id: string, ids: string[]) {
                return new HttpDeleteFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/items`, null, json(ids))
            }
        }
    }

    public static queues(deviceId: string): QueueApiClient {
        return {
            get deviceId() { return deviceId },
            enqueue(queueId: string, sourceDevice: string, sourceIds: string[]) {
                return new HttpPostFetch(`${devicesBaseUri}/${deviceId}/queues/${queueId}/items`, null, json({ deviceId: sourceDevice, items: sourceIds }))
            },
            clear(queueId: string) {
                return new HttpDeleteFetch(`${devicesBaseUri}/${deviceId}/queues/${queueId}/items`, null)
            }
        }
    }

    public static control(deviceId: string): ControlApiClient {
        deviceId = encodeURIComponent(deviceId);
        return {
            get deviceId() { return deviceId },
            state(detailed = false) { return new JsonHttpFetch(`${devicesBaseUri}/${deviceId}/state${detailed ? "?detailed=true" : ""}`) },
            play(id?: string, sourceDevice?: string) {
                return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "playing", objectId: id, sourceDevice }))
            },
            playUri(id: string) { return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "playing", currentUri: id })) },
            pause() { return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "paused" })) },
            stop() { return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "stopped" })) },
            prev() { return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "playing-prev" })) },
            next() { return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "playing-next" })) },
            position(detailed = false) { return new JsonHttpFetch(`${devicesBaseUri}/${deviceId}/position${detailed ? "?detailed=true" : ""}`) },
            seek(position: number | string) {
                return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/position`, null,
                    json(typeof position === "number" ? { position: position } : { relTime: position }))
            },
            setPlayMode(mode: string) { return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/play-mode`, null, json(mode)) },
            volume(detailed = false) { return new JsonHttpFetch(`${devicesBaseUri}/${deviceId}/volume${detailed ? "?detailed=true" : ""}`) },
            setVolume(volume: number) { return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/volume`, null, json(volume)) },
            getMute() { return new JsonHttpFetch(`${devicesBaseUri}/${deviceId}/mute`) },
            setMute(mute: boolean) { return new HttpPutFetch(`${devicesBaseUri}/${deviceId}/mute`, null, json(mute)) }
        }
    }

    public static notifications(): PushSubscriptionApiClient { return pushSubscriber }

    public static getAppInfo() {
        return new JsonHttpFetch<ApplicationInfo>(`${baseUri}/info`).json()
    }
}

const pushSubscriber = {
    subscribe(endpoint: string, type: PushNotificationType, p256dh: ArrayBuffer | null, auth: ArrayBuffer | null) {
        return new HttpPostFetch(`${baseUri}/push-subscriptions`, null, json({ endpoint, type, p256dhKey: toBase64(p256dh), authKey: toBase64(auth) }))
    },
    unsubscribe(endpoint: string, type: PushNotificationType) {
        return new HttpDeleteFetch(`${baseUri}/push-subscriptions`, null, json({ endpoint, type }))
    },
    subscribed(endpoint: string, type: PushNotificationType) { return new JsonHttpFetch<boolean>(`${baseUri}/push-subscriptions`, { endpoint, type }) },
    serverKey() { return new HttpFetch(`${baseUri}/push-subscriptions/server-key`) }
}

export class BrowseFetch extends JsonHttpFetch<Upnp.BrowseFetchResult> {
    constructor(path: string, query: RequestQuery = {}) {
        super(path, query);
    }

    withParents() { return new BrowseFetch(this.path, { ...this.query, withParents: true }) }

    withResource() { return new BrowseFetch(this.path, { ...this.query, withResourceProps: true }) }

    withVendor() { return new BrowseFetch(this.path, { ...this.query, withVendorProps: true }) }

    withMetadata() { return new BrowseFetch(this.path, { ...this.query, withMetadata: true }) }

    withDevice() { return new BrowseFetch(this.path, { ...this.query, withDevice: true }) }

    withOptions(options: BrowseOptions) { return new BrowseFetch(this.path, { ...this.query, ...options }) }

    take(count: number) { return new BrowseFetch(this.path, { ...this.query, take: count }) }

    skip(count: number) { return new BrowseFetch(this.path, { ...this.query, skip: count }) }
}

function createFormData(files: Iterable<File>, useProxy?: boolean) {
    const data = new FormData();
    for (let file of files) data.append("files", file);
    if (useProxy) data.set("useProxy", "true");
    return data;
}

function json(data: any): RequestInit {
    return {
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    }
}