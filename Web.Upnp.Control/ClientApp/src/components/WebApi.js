import { HttpFetch, JsonFetch, JsonPostFetch, JsonPutFetch, JsonDeleteFetch } from "./HttpFetch";

const baseUri = "/api/devices";

export default class {

    static devices = (category, id) => new HttpFetch(`${baseUri}${id ? `/${id}` : ""}${category ? "?category=" + category : ""}`);

    static browse = (deviceId) => ({
        get: (id = "") => new BrowseFetch(`${baseUri}/${deviceId}/items/${id}`)
    });

    static playlist = (deviceId) => ({
        create: title => new JsonPostFetch(`${baseUri}/${deviceId}/playlists`, null, { body: JSON.stringify(title) }),
        rename: (id, title) => new JsonPutFetch(`${baseUri}/${deviceId}/playlists/${id}`, null, { body: JSON.stringify(title) }),
        delete: ids => new JsonDeleteFetch(`${baseUri}/${deviceId}/playlists`, null, { body: JSON.stringify(ids) }),
        copy: id => new JsonFetch(`${baseUri}/${deviceId}/playlists/${id}`, null, { method: "COPY" }),
        addItems: (id, sourceDevice, sourceIds) => new JsonPutFetch(`${baseUri}/${deviceId}/playlists/${id}/items`,
            null, { body: JSON.stringify({ deviceId: sourceDevice, items: sourceIds }) }),
        removeItems: (id, ids) => new JsonDeleteFetch(`${baseUri}/${deviceId}/playlists/${id}/items`, null, { body: JSON.stringify(ids) })
    });

    static control = (deviceId) => {
        deviceId = encodeURIComponent(deviceId);
        return {
            state: (detailed = false) => new JsonFetch(`${baseUri}/${deviceId}/state${detailed ? "?detailed" : ""}`),
            playlistState: () => new JsonFetch(`${baseUri}/${deviceId}/playlist-state`),
            play: id => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing", objectId: id }) }),
            playUri: id => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing", currentUri: id }) }),
            pause: () => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "paused" }) }),
            stop: () => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "stopped" }) }),
            prev: () => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing-prev" }) }),
            next: () => new JsonPutFetch(`${baseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing-next" }) }),
            position: (detailed = false) => new JsonFetch(`${baseUri}/${deviceId}/position${detailed ? "?detailed" : ""}`),
            seek: position => new JsonPutFetch(`${baseUri}/${deviceId}/position`, null,
                { body: JSON.stringify(typeof position === "number" ? { position: position } : { relTime: position }) }),
            setPlayMode: mode => new JsonPutFetch(`${baseUri}/${deviceId}/play-mode`, null, { body: JSON.stringify(mode) }),
            volume: (detailed = false) => new JsonFetch(`${baseUri}/${deviceId}/volume${detailed ? "?detailed" : ""}`),
            setVolume: volume => new JsonPutFetch(`${baseUri}/${deviceId}/volume`, null, { body: volume }),
            getMute: () => new JsonFetch(`${baseUri}/${deviceId}/mute`),
            setMute: mute => new JsonPutFetch(`${baseUri}/${deviceId}/mute`, null, { body: mute })
        };
    }
}

export class BrowseFetch extends HttpFetch {
    constructor(path, query = {}) {
        super(path, query);
    }

    withParents = () => { return new BrowseFetch(this.path, { ...this.query, withParents: true }); };

    withResource = () => { return new BrowseFetch(this.path, { ...this.query, withResourceProps: true }); };

    withVendor = () => { return new BrowseFetch(this.path, { ...this.query, withVendorProps: true }); };

    take = (count) => { return new BrowseFetch(this.path, { ...this.query, take: count }); };

    skip = (count) => { return new BrowseFetch(this.path, { ...this.query, skip: count }); };
};