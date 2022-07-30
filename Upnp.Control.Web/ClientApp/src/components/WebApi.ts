import { AVPosition, AVState, BrowseFetchResult, PlaybackMode, RCState, UpnpDevice } from "../routes/common/Types";
import { toBase64 } from "./Extensions";
import { HttpFetch, JsonHttpFetch, RequestQuery, HttpPostFetch, HttpPutFetch, HttpDeleteFetch } from "./HttpFetch";

const baseUri = "/api";
const devicesBaseUri = baseUri + "/devices";
type BrowseOptionFlags = "withParents" | "withResourceProps" | "withVendorProps" | "withMetadata" | "withDevice";
export type BrowseOptions = { [K in BrowseOptionFlags]?: boolean };
export type ApplicationInfo = {
    build: { version?: string, date?: string },
    product?: string,
    hostName: string,
    addresses: string[]
}

export interface ControlApiProvider {
    state: (detailed?: boolean) => JsonHttpFetch<AVState>;
    play: (id?: string, sourceDevice?: string) => HttpPutFetch;
    playUri: (id: string) => HttpPutFetch;
    pause: () => HttpPutFetch;
    stop: () => HttpPutFetch;
    prev: () => HttpPutFetch;
    next: () => HttpPutFetch;
    position: (detailed?: boolean) => JsonHttpFetch<AVPosition>;
    seek: (position: number | string) => HttpPutFetch;
    setPlayMode: (mode: PlaybackMode) => HttpPutFetch;
    volume: (detailed?: boolean) => JsonHttpFetch<RCState>;
    setVolume: (volume: number) => HttpPutFetch;
    getMute: () => JsonHttpFetch<boolean>;
    setMute: (mute: boolean) => HttpPutFetch;
}

export interface PlaylistApiProvider {
    state: () => JsonHttpFetch<any>;
    create: (title: string) => HttpPostFetch;
    createFromItems: (title: string, sourceDevice: string, sourceIds: string[], maxDepth?: number) => HttpPostFetch;
    createFromFiles: (data: Iterable<File> | FormData, title?: string | null, merge?: boolean, useProxy?: boolean) => HttpPostFetch;
    rename: (id: string, title: string) => HttpPutFetch;
    delete: (ids: string[]) => HttpDeleteFetch;
    copy: (id: string, title: string) => HttpPostFetch;
    addItems: (id: string, sourceDevice: string, sourceIds: string[], maxDepth?: number) => HttpPostFetch;
    addUrl: (id: string, mediaUrl: string, title?: string, useProxy?: boolean) => HttpPostFetch;
    addFromFiles: (id: string, data: Iterable<File> | FormData, useProxy?: boolean) => HttpPostFetch;
    removeItems: (id: string, ids: string[]) => HttpDeleteFetch;
}

export interface QueueApiProvider {
    enqueue: (queueId: string, sourceDevice: string, sourceIds: string[]) => HttpPostFetch;
    clear: (queueId: string) => HttpDeleteFetch;
}

export const enum PushNotificationType {
    None = 0x0,
    DeviceDiscovery = 0x1,
    PlaybackStateChange = 0x2,
    ContentUpdated = 0x4
}

export interface PushSubscriptionApiProvider {
    serverKey(): HttpFetch;
    subscribe(endpoint: string, type: PushNotificationType, p256dh: ArrayBuffer | null, auth: ArrayBuffer | null): HttpPostFetch;
    unsubscribe(endpoint: string, type: PushNotificationType): HttpDeleteFetch;
    subscribed(endpoint: string, type: PushNotificationType): JsonHttpFetch<boolean>;
}

export default class WebApi {

    public static devices(category: string): JsonHttpFetch<UpnpDevice[]>;
    public static devices(category: string, id: string): JsonHttpFetch<UpnpDevice>;
    public static devices(category: string, id?: string) {
        return new JsonHttpFetch<UpnpDevice | UpnpDevice[]>(`${devicesBaseUri}${id ? `/${id}` : ""}${category ? "?category=" + category : ""}`);
    };

    static browse = (deviceId: string) => ({
        get: (id = "") => new BrowseFetch(`${devicesBaseUri}/${deviceId}/items/${id}`)
    });

    static playlist = (deviceId: string): PlaylistApiProvider => ({
        state: () => new JsonHttpFetch(`${devicesBaseUri}/${deviceId}/playlists/state`),
        create: (title: string) => new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists`, null, json(title)),
        createFromItems: (title: string, sourceDevice: string, sourceIds: string[], maxDepth?: number) =>
            new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists/items`, null,
                json({ title, source: { deviceId: sourceDevice, items: sourceIds, maxDepth } })),
        createFromFiles: (data: Iterable<File> | FormData, title?: string | null, merge?: boolean, useProxy?: boolean) => {
            const url = `${devicesBaseUri}/${deviceId}/playlists/files`;

            if (data instanceof FormData) {
                return new HttpPostFetch(url, null, { body: data });
            }

            const formData = createFormData(data, useProxy);
            if (title) formData.set("title", title);
            if (merge) formData.set("merge", "true");

            return new HttpPostFetch(url, null, { body: formData });
        },
        rename: (id: string, title: string) => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}`, null, json(title)),
        delete: (ids: string[]) => new HttpDeleteFetch(`${devicesBaseUri}/${deviceId}/playlists`, null, json(ids)),
        copy: (id: string, title?: string) => new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/copy`, null, json(title)),
        addItems: (id: string, sourceDevice: string, sourceIds: string[], maxDepth?: number) =>
            new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/items`, null, json({ deviceId: sourceDevice, items: sourceIds, maxDepth })),
        addUrl: (id: string, url: string, title?: string, useProxy?: boolean) =>
            new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/feeds`, null, json({ url, title, useProxy })),
        addFromFiles: (id: string, data: Iterable<File> | FormData, useProxy?: boolean) =>
            new HttpPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/files`, null, { body: data instanceof FormData ? data : createFormData(data, useProxy) }),
        removeItems: (id: string, ids: string[]) =>
            new HttpDeleteFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/items`, null, json(ids))
    });

    static queues = (deviceId: string): QueueApiProvider => ({
        enqueue: (queueId: string, sourceDevice: string, sourceIds: string[]) =>
            new HttpPostFetch(`${devicesBaseUri}/${deviceId}/queues/${queueId}/items`, null, json({ deviceId: sourceDevice, items: sourceIds })),
        clear: (queueId: string) => new HttpDeleteFetch(`${devicesBaseUri}/${deviceId}/queues/${queueId}/items`, null)
    });

    static control = (deviceId: string): ControlApiProvider => {
        deviceId = encodeURIComponent(deviceId);
        return {
            state: (detailed = false) => new JsonHttpFetch(`${devicesBaseUri}/${deviceId}/state${detailed ? "?detailed=true" : ""}`),
            play: (id?: string, sourceDevice?: string) => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null,
                json({ state: "playing", objectId: id, sourceDevice })),
            playUri: (id: string) => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "playing", currentUri: id })),
            pause: () => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "paused" })),
            stop: () => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "stopped" })),
            prev: () => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "playing-prev" })),
            next: () => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, json({ state: "playing-next" })),
            position: (detailed = false) => new JsonHttpFetch(`${devicesBaseUri}/${deviceId}/position${detailed ? "?detailed=true" : ""}`),
            seek: (position: number | string) => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/position`, null,
                json(typeof position === "number" ? { position: position } : { relTime: position })),
            setPlayMode: (mode: string) => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/play-mode`, null, json(mode)),
            volume: (detailed = false) => new JsonHttpFetch(`${devicesBaseUri}/${deviceId}/volume${detailed ? "?detailed=true" : ""}`),
            setVolume: (volume: number) => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/volume`, null, json(volume)),
            getMute: () => new JsonHttpFetch(`${devicesBaseUri}/${deviceId}/mute`),
            setMute: (mute: boolean) => new HttpPutFetch(`${devicesBaseUri}/${deviceId}/mute`, null, json(mute))
        };
    }

    static notifications = (): PushSubscriptionApiProvider => pushSubscriber;

    static getAppInfo(): Promise<ApplicationInfo> {
        return new JsonHttpFetch<ApplicationInfo>(`${baseUri}/info`).json();
    }
}

const pushSubscriber = {
    subscribe: (endpoint: string, type: PushNotificationType, p256dh: ArrayBuffer | null, auth: ArrayBuffer | null) =>
        new HttpPostFetch(`${baseUri}/push-subscriptions`, null, json({ endpoint, type, p256dhKey: toBase64(p256dh), authKey: toBase64(auth) })),
    unsubscribe: (endpoint: string, type: PushNotificationType) =>
        new HttpDeleteFetch(`${baseUri}/push-subscriptions`, null, json({ endpoint, type })),
    subscribed: (endpoint: string, type: PushNotificationType) => new JsonHttpFetch<boolean>(`${baseUri}/push-subscriptions`, { endpoint, type }),
    serverKey: () => new HttpFetch(`${baseUri}/push-subscriptions/server-key`)
}

export class BrowseFetch extends JsonHttpFetch<BrowseFetchResult> {
    constructor(path: string, query: RequestQuery = {}) {
        super(path, query);
    }

    withParents = () => { return new BrowseFetch(this.path, { ...this.query, withParents: true }); };

    withResource = () => { return new BrowseFetch(this.path, { ...this.query, withResourceProps: true }); };

    withVendor = () => { return new BrowseFetch(this.path, { ...this.query, withVendorProps: true }); };

    withMetadata = () => { return new BrowseFetch(this.path, { ...this.query, withMetadata: true }); };

    withDevice = () => { return new BrowseFetch(this.path, { ...this.query, withDevice: true }); };

    withOptions = (options: BrowseOptions) => { return new BrowseFetch(this.path, { ...this.query, ...options }); };

    take = (count: number) => { return new BrowseFetch(this.path, { ...this.query, take: count }); };

    skip = (count: number) => { return new BrowseFetch(this.path, { ...this.query, skip: count }); };
};

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