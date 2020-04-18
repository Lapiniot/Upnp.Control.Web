import { HttpFetch, JsonFetch, JsonPostFetch, JsonPutFetch, JsonDeleteFetch } from "./HttpFetch";

const controlBaseUrl = "/api/upnpcontrol/";
const discoverBaseUrl = "/api/discovery/";
const browseBaseUrl = "/api/browse/";
const playlistBaseUrl = "/api/playlist/";

export default class {

    static discover = (category) => new HttpFetch(`${discoverBaseUrl}${category}`);

    static browse = (deviceId) => ({
        get: (id = "") => new BrowseFetch(`${browseBaseUrl}${deviceId}/${id}`),
        parents: id => new HttpFetch(`${browseBaseUrl}parents/${deviceId}/${id}`),
        metadata: id => new HttpFetch(`${browseBaseUrl}metadata/${deviceId}/${id}`)
    });

    static playlist = (deviceId) => ({
        create: title => new JsonPostFetch(`${playlistBaseUrl}${deviceId}`, null, { body: JSON.stringify({ Title: title }) }),
        rename: (id, title) => new JsonPutFetch(`${playlistBaseUrl}${deviceId}`, null, { body: JSON.stringify({ Id: id, Title: title }) }),
        delete: ids => new JsonDeleteFetch(`${playlistBaseUrl}${deviceId}`, null, { body: JSON.stringify(ids) }),
        copy: id => new JsonFetch(`${playlistBaseUrl}${deviceId}/${id}`, null, { method: "COPY" }),
        addItems: (id, sourceDevice, sourceIds) => new JsonPutFetch(`${playlistBaseUrl}${deviceId}/${id}/add`, null, { body: JSON.stringify({ DeviceId: sourceDevice, Items: sourceIds }) }),
        removeItems: (id, ids) => new JsonDeleteFetch(`${playlistBaseUrl}${deviceId}/${id}/remove`, null, { body: JSON.stringify(ids) })
    });

    static control = (deviceId) => {
        deviceId = encodeURIComponent(deviceId);
        return {
            state: (detailed = false) => new JsonFetch(`${controlBaseUrl}${deviceId}/state${detailed && "?detailed"}`),
            playlistState: () => new JsonFetch(`${controlBaseUrl}${deviceId}/playlist_state`),
            position: (detailed = false) => new JsonFetch(`${controlBaseUrl}${deviceId}/position${detailed && "?detailed"}`),
            play: (id) => new JsonFetch(`${controlBaseUrl}${deviceId}/play()${id ? "?id=" + encodeURIComponent(id) : ""}`),
            playUri: (uri) => new JsonFetch(`${controlBaseUrl}${deviceId}/play_uri()?uri=${encodeURIComponent(uri)}`),
            pause: () => new JsonFetch(`${controlBaseUrl}${deviceId}/pause()`),
            stop: () => new JsonFetch(`${controlBaseUrl}${deviceId}/stop()`),
            prev: () => new JsonFetch(`${controlBaseUrl}${deviceId}/prev()`),
            next: () => new JsonFetch(`${controlBaseUrl}${deviceId}/next()`),
        };
    }
}

class BrowseFetch extends HttpFetch {
    constructor(path, query = {}) {
        super(path, query);
    }

    withParents = () => { return new BrowseFetch(this.path, { ...this.query, withParents: true }); };

    withResource = () => { return new BrowseFetch(this.path, { ...this.query, resource: true }); };

    withVendor = () => { return new BrowseFetch(this.path, { ...this.query, vendor: true }); };

    take = (count) => { return new BrowseFetch(this.path, { ...this.query, take: count }); };

    skip = (count) => { return new BrowseFetch(this.path, { ...this.query, skip: count }); };
};