import { HttpFetch, JsonFetch, JsonPostFetch, JsonPutFetch, JsonDeleteFetch } from "./Http/HttpFetch";

export default class {
    static discover = function (category) {
        return new HttpFetch(`/api/discovery/${category}`);
    }

    static browse(deviceId) {
        return {
            get: (id = "") => {
                return new BrowseFetch(`/api/browse/${deviceId}/${id}`);
            },
            parents: id => {
                return new HttpFetch(`/api/browse/parents/${deviceId}/${id}`);
            },
            metadata: id => {
                return new HttpFetch(`/api/browse/metadata/${deviceId}/${id}`);
            }
        };
    }

    static playlist(deviceId) {
        return {
            create: title => {
                return new JsonPostFetch(`/api/playlist/${deviceId}`, null, { body: JSON.stringify({ title: title }) });
            },
            rename: (id, title) => {
                return new JsonPutFetch(`/api/playlist/${deviceId}`, null, { body: JSON.stringify({ id: id, title: title }) });
            },
            delete: ids => {
                return new JsonDeleteFetch(`/api/playlist/${deviceId}`, null, { body: JSON.stringify(ids) });
            },
            copy: id => {
                return new JsonFetch(`/api/playlist/${deviceId}/${id}`, null, { method: "COPY" });
            },
            add: (id, sourceDevice, sourceIds) => {
                return new JsonPutFetch(`/api/playlist/${deviceId}/${id}/add`, null,
                    { body: JSON.stringify({ deviceId: sourceDevice, items: sourceIds }) });
            }
        };
    }
}

class BrowseFetch extends HttpFetch {
    constructor(path, query = {}) {
        super(path, query);
    }

    withParents() {
        return new BrowseFetch(this.path, { ...this.query, withParents: true });
    }

    take(count) {
        return new BrowseFetch(this.path, { ...this.query, take: count });
    }

    skip(count) {
        return new BrowseFetch(this.path, { ...this.query, skip: count });
    }
};