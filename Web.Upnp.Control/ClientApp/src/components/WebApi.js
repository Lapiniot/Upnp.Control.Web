import { HttpFetch, JsonFetch, JsonPostFetch, JsonPutFetch, JsonDeleteFetch } from "./HttpFetch";

const devicesBaseUri = "/api/devices";
const playlistBaseUrl = "/api/playlist/";

export default class {

    static devices = (category, id) => new HttpFetch(`${devicesBaseUri}${id ? `/${id}` : ""}${category ? "?category=" + category : ""}`);

    static browse = (deviceId) => ({
        get: (id = "") => new BrowseFetch(`${devicesBaseUri}/${deviceId}/items/${id}`)
    });

    static playlist = (deviceId) => ({
        create: title => new JsonPostFetch(`${playlistBaseUrl}${deviceId}`, null, { body: JSON.stringify({ Title: title }) }),
        rename: (id, title) => new JsonPutFetch(`${playlistBaseUrl}${deviceId}`, null, { body: JSON.stringify({ Id: id, Title: title }) }),
        delete: ids => new JsonDeleteFetch(`${playlistBaseUrl}${deviceId}`, null, { body: JSON.stringify(ids) }),
        copy: id => new JsonFetch(`${playlistBaseUrl}${deviceId}/${id}`, null, { method: "COPY" }),
        addItems: (id, sourceDevice, sourceIds) => new JsonPutFetch(`${playlistBaseUrl}${deviceId}/${id}/add`,
            null, { body: JSON.stringify({ DeviceId: sourceDevice, Items: sourceIds }) }),
        removeItems: (id, ids) => new JsonDeleteFetch(`${playlistBaseUrl}${deviceId}/${id}/remove`, null, { body: JSON.stringify(ids) })
    });

    static control = (deviceId) => {
        deviceId = encodeURIComponent(deviceId);
        return {
            state: (detailed = false) => new JsonFetch(`${devicesBaseUri}/${deviceId}/state${detailed ? "?detailed" : ""}`),
            playlistState: () => new JsonFetch(`${devicesBaseUri}/${deviceId}/playlist-state`),
            play: id => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing", objectId: id }) }),
            playUri: id => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing", currentUri: id }) }),
            pause: () => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "paused" }) }),
            stop: () => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "stopped" }) }),
            prev: () => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing-prev" }) }),
            next: () => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/state`, null, { body: JSON.stringify({ state: "playing-next" }) }),
            position: (detailed = false) => new JsonFetch(`${devicesBaseUri}/${deviceId}/position${detailed ? "?detailed" : ""}`),
            seek: position => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/position`, null,
                { body: JSON.stringify(typeof position === "number" ? { position: position } : { relTime: position }) }),
            setPlayMode: mode => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/play-mode`, null, { body: JSON.stringify(mode) }),
            volume: (detailed = false) => new JsonFetch(`${devicesBaseUri}/${deviceId}/volume${detailed ? "?detailed" : ""}`),
            setVolume: volume => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/volume`, null, { body: volume }),
            getMute: () => new JsonFetch(`${devicesBaseUri}/${deviceId}/mute`),
            setMute: mute => new JsonPutFetch(`${devicesBaseUri}/${deviceId}/mute`, null, { body: mute })
        };
    }
}

class BrowseFetch extends HttpFetch {
    constructor(path, query = {}) {
        super(path, query);
    }

    withParents = () => { return new BrowseFetch(this.path, { ...this.query, withParents: true }); };

    withResource = () => { return new BrowseFetch(this.path, { ...this.query, withResourceProps: true }); };

    withVendor = () => { return new BrowseFetch(this.path, { ...this.query, withVendorProps: true }); };

    take = (count) => { return new BrowseFetch(this.path, { ...this.query, take: count }); };

    skip = (count) => { return new BrowseFetch(this.path, { ...this.query, skip: count }); };
};