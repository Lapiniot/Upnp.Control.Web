import { PlaybackMode } from "../routes/common/Types";
import { toBase64 } from "./Extensions";
import { HttpFetch, JsonFetch, JsonPostFetch, JsonPutFetch, JsonDeleteFetch, RequestQuery, HttpPost } from "./HttpFetch";

const baseUri = "/api";
const devicesBaseUri = baseUri + "/devices";

export interface ControlApiProvider {
    state: (detailed?: boolean) => JsonFetch;
    play: (id?: string, sourceDevice?: string) => JsonPutFetch;
    playUri: (id: string) => JsonPutFetch;
    pause: () => JsonPutFetch;
    stop: () => JsonPutFetch;
    prev: () => JsonPutFetch;
    next: () => JsonPutFetch;
    position: (detailed?: boolean) => JsonFetch;
    seek: (position: number | string) => JsonPutFetch;
    setPlayMode: (mode: PlaybackMode) => JsonPutFetch;
    volume: (detailed?: boolean) => JsonFetch;
    setVolume: (volume: number) => JsonPutFetch;
    getMute: () => JsonFetch;
    setMute: (mute: boolean) => JsonPutFetch;
}

export interface PlaylistApiProvider {
    state: () => JsonFetch;
    create: (title: string) => JsonPostFetch;
    createFromItems: (title: string, sourceDevice: string, sourceIds: string[], maxDepth?: number) => JsonPostFetch;
    createFromFiles: (data: Iterable<File> | FormData, title?: string | null, merge?: boolean, useProxy?: boolean) => HttpPost;
    rename: (id: string, title: string) => JsonPutFetch;
    delete: (ids: string[]) => JsonDeleteFetch;
    copy: (id: string, title: string) => JsonFetch;
    addItems: (id: string, sourceDevice: string, sourceIds: string[], maxDepth?: number) => JsonPostFetch;
    addUrl: (id: string, mediaUrl: string, title?: string, useProxy?: boolean) => JsonPostFetch;
    addFromFiles: (id: string, data: Iterable<File> | FormData, useProxy?: boolean) => HttpPost;
    removeItems: (id: string, ids: string[]) => JsonDeleteFetch;
}

export interface QueueApiProvider {
    enqueue: (queueId: string, sourceDevice: string, sourceIds: string[]) => JsonPostFetch;
    clear: (queueId: string) => JsonDeleteFetch;
}

export enum NotificationType {
    None = 0x0,
    DeviceDiscovery = 0x1,
    PlaybackStateChange = 0x2,
    ContentUpdated = 0x4
}

export interface PushSubscriptionApiProvider {
    serverKey(): HttpFetch;
    subscribe(endpoint: string, type: NotificationType, p256dh: ArrayBuffer | null, auth: ArrayBuffer | null): JsonPostFetch;
    unsubscribe(endpoint: string, type: NotificationType): JsonDeleteFetch;
    subscribed(endpoint: string, type: NotificationType): JsonFetch;
}

export default class WebApi {

    static devices = (category: string, id?: string) => new HttpFetch(`${devicesBaseUri}${id ? `/${id}` : ""}${category ? "?category=" + category : ""}`);

    static browse = (deviceId: string) => ({
        get: (id = "") => new BrowseFetch(`${devicesBaseUri}/${deviceId}/items/${id}`)
    });

    static playlist = (deviceId: string): PlaylistApiProvider => ({
        state: () => new JsonFetch(`${devicesBaseUri}/${deviceId}/playlists/state`),
        create: (title: string) => new JsonPostFetch(`${devicesBaseUri}/${deviceId}/playlists`, null, { body: JSON.stringify(title) }),
        createFromItems: (title: string, sourceDevice: string, sourceIds: string[], maxDepth?: number) =>
            new JsonPostFetch(`${devicesBaseUri}/${deviceId}/playlists/items`, null,
                { body: JSON.stringify({ title, source: { deviceId: sourceDevice, items: sourceIds, maxDepth } }) }),
        createFromFiles: (data: Iterable<File> | FormData, title?: string | null, merge?: boolean, useProxy?: boolean) => {
            const url = `${devicesBaseUri}/${deviceId}/playlists/files`;

            if (data instanceof FormData) {
                return new HttpPost(url, null, { body: data });
            }

            const formData = createFormData(data, useProxy);
            if (title) formData.set("title", title);
            if (merge) formData.set("merge", merge.toString());

            return new HttpPost(url, null, { body: formData });
        },
        rename: (id: string, title: string) => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}`, null, { body: JSON.stringify(title) }),
        delete: (ids: string[]) => new JsonDeleteFetch(`${devicesBaseUri}/${deviceId}/playlists`, null, { body: JSON.stringify(ids) }),
        copy: (id: string, title?: string) => new JsonPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/copy`, null, { body: JSON.stringify(title) }),
        addItems: (id: string, sourceDevice: string, sourceIds: string[], maxDepth?: number) =>
            new JsonPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/items`, null,
                { body: JSON.stringify({ deviceId: sourceDevice, items: sourceIds, maxDepth }) }),
        addUrl: (id: string, url: string, title?: string, useProxy?: boolean) =>
            new JsonPostFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/feeds`, null,
                { body: JSON.stringify({ url, title, useProxy }) }),
        addFromFiles: (id: string, data: Iterable<File> | FormData, useProxy?: boolean) => {
            return new HttpPost(`${devicesBaseUri}/${deviceId}/playlists/${id}/files`, null,
                { body: data instanceof FormData ? data : createFormData(data, useProxy) });
        },
        removeItems: (id: string, ids: string[]) => new JsonDeleteFetch(`${devicesBaseUri}/${deviceId}/playlists/${id}/items`, null, { body: JSON.stringify(ids) })
    });

    static queues = (deviceId: string): QueueApiProvider => ({
        enqueue: (queueId: string, sourceDevice: string, sourceIds: string[]) =>
            new JsonPostFetch(`${devicesBaseUri}/${deviceId}/queues/${queueId}/items`, null, {
                body: JSON.stringify({ deviceId: sourceDevice, items: sourceIds })
            }),
        clear: (queueId: string) => new JsonDeleteFetch(`${devicesBaseUri}/${deviceId}/queues/${queueId}/items`, null, { body: null })
    });

    static control = (deviceId: string): ControlApiProvider => {
        deviceId = encodeURIComponent(deviceId);
        return {
            state: (detailed = false) => new JsonFetch(`${devicesBaseUri}/${deviceId}/state${detailed ? "?detailed" : ""}`),
            play: (id?: string, sourceDevice?: string) => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null,
                { body: JSON.stringify({ state: "playing", objectId: id, sourceDevice }) }),
            playUri: (id: string) => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing", currentUri: id }) }),
            pause: () => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "paused" }) }),
            stop: () => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "stopped" }) }),
            prev: () => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing-prev" }) }),
            next: () => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing-next" }) }),
            position: (detailed = false) => new JsonFetch(`${devicesBaseUri}/${deviceId}/position${detailed ? "?detailed" : ""}`),
            seek: (position: number | string) => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/position`, null,
                { body: JSON.stringify(typeof position === "number" ? { position: position } : { relTime: position }) }),
            setPlayMode: (mode: string) => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/play-mode`, null, { body: JSON.stringify(mode) }),
            volume: (detailed = false) => new JsonFetch(`${devicesBaseUri}/${deviceId}/volume${detailed ? "?detailed" : ""}`),
            setVolume: (volume: number) => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/volume`, null, { body: JSON.stringify(volume) }),
            getMute: () => new JsonFetch(`${devicesBaseUri}/${deviceId}/mute`),
            setMute: (mute: boolean) => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/mute`, null, { body: JSON.stringify(mute) })
        };
    }

    static notifications = (): PushSubscriptionApiProvider => {
        return pushSubscriber;
    }
}

const pushSubscriber = {
    subscribe: (endpoint: string, type: NotificationType, p256dh: ArrayBuffer | null, auth: ArrayBuffer | null) =>
        new JsonPostFetch(`${baseUri}/push-subscriptions`, null, { body: JSON.stringify({ endpoint, type, p256dhKey: toBase64(p256dh), authKey: toBase64(auth) }) }),
    unsubscribe: (endpoint: string, type: NotificationType) =>
        new JsonDeleteFetch(`${baseUri}/push-subscriptions`, null, { body: JSON.stringify({ endpoint, type }) }),
    subscribed: (endpoint: string, type: NotificationType) => new JsonFetch(`${baseUri}/push-subscriptions`, { endpoint, type }),
    serverKey: () => new HttpFetch(`${baseUri}/push-subscriptions/server-key`)
}

type BrowseOptionFlags = "withParents" | "withResourceProps" | "withVendorProps" | "withMetadata" | "withDevice";

type BrowseOptions = { [K in BrowseOptionFlags]?: boolean };

export class BrowseFetch extends HttpFetch {
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

function createFormData(files: Iterable<File>, useProxy: boolean | undefined) {
    const data = new FormData();
    for (let file of files) data.append("files", file);
    if (useProxy) data.set("useProxy", useProxy.toString());
    return data;
}

