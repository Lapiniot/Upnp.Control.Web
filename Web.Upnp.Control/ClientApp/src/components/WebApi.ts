﻿import { HttpFetch, JsonFetch, JsonPostFetch, JsonPutFetch, JsonDeleteFetch, RequestQuery } from "./HttpFetch";

const baseUri = "/api/devices";

export default class {

    static devices = (category: string, id?: string) => new HttpFetch(`${baseUri}${id ? `/${id}` : ""}${category ? "?category=" + category : ""}`);

    static browse = (deviceId: string) => ({
        get: (id = "") => new BrowseFetch(`${baseUri}/${deviceId}/items/${id}`)
    });

    static playlist = (deviceId: string) => ({
        create: (title: string) => new JsonPostFetch(`${baseUri}/${deviceId}/playlists`, null, { body: JSON.stringify(title) }),
        rename: (id: string, title: string) => new JsonPutFetch(`${baseUri}/${deviceId}/playlists/${id}`, null, { body: JSON.stringify(title) }),
        delete: (ids: string[]) => new JsonDeleteFetch(`${baseUri}/${deviceId}/playlists`, null, { body: JSON.stringify(ids) }),
        copy: (id: string) => new JsonFetch(`${baseUri}/${deviceId}/playlists/${id}`, null, { method: "COPY" }),
        addItems: (id: string, sourceDevice: string, sourceIds: string[]) => new JsonPutFetch(`${baseUri}/${deviceId}/playlists/${id}/items`,
            null, { body: JSON.stringify({ deviceId: sourceDevice, items: sourceIds }) }),
        removeItems: (id: string, ids: string[]) => new JsonDeleteFetch(`${baseUri}/${deviceId}/playlists/${id}/items`, null, { body: JSON.stringify(ids) })
    });

    static control = (deviceId: string) => {
        deviceId = encodeURIComponent(deviceId);
        return {
            state: (detailed = false) => new JsonFetch(`${baseUri}/${deviceId}/state${detailed ? "?detailed" : ""}`),
            playlistState: () => new JsonFetch(`${baseUri}/${deviceId}/playlist-state`),
            play: (id: string) => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing", objectId: id }) }),
            playUri: (id: string) => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing", currentUri: id }) }),
            pause: () => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "paused" }) }),
            stop: () => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "stopped" }) }),
            prev: () => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing-prev" }) }),
            next: () => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing-next" }) }),
            position: (detailed = false) => new JsonFetch(`${baseUri}/${deviceId}/position${detailed ? "?detailed" : ""}`),
            seek: (position: number | string) => new JsonPutFetch(`${baseUri}/${deviceId}/position`, null,
                { body: JSON.stringify(typeof position === "number" ? { position: position } : { relTime: position }) }),
            setPlayMode: (mode: string) => new JsonPutFetch(`${baseUri}/${deviceId}/play-mode`, null, { body: JSON.stringify(mode) }),
            volume: (detailed = false) => new JsonFetch(`${baseUri}/${deviceId}/volume${detailed ? "?detailed" : ""}`),
            setVolume: (volume: number) => new JsonPutFetch(`${baseUri}/${deviceId}/volume`, null, { body: JSON.stringify(volume) }),
            getMute: () => new JsonFetch(`${baseUri}/${deviceId}/mute`),
            setMute: (mute: boolean) => new JsonPutFetch(`${baseUri}/${deviceId}/mute`, null, { body: JSON.stringify(mute) })
        };
    }
}

export class BrowseFetch extends HttpFetch {
    constructor(path: string, query: RequestQuery = {}) {
        super(path, query);
    }

    withParents = () => { return new BrowseFetch(this.path, { ...this.query, withParents: true }); };

    withResource = () => { return new BrowseFetch(this.path, { ...this.query, withResourceProps: true }); };

    withVendor = () => { return new BrowseFetch(this.path, { ...this.query, withVendorProps: true }); };

    take = (count: number) => { return new BrowseFetch(this.path, { ...this.query, take: count }); };

    skip = (count: number) => { return new BrowseFetch(this.path, { ...this.query, skip: count }); };
};