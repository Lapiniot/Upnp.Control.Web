import { HttpFetch, JsonFetch, JsonPostFetch, JsonPutFetch, JsonDeleteFetch } from "./Http/HttpFetch";

export default class {
    static discover = function(category) {
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
            add: name => {
                return new JsonPostFetch(`/api/playlist/${deviceId}/add`, null, { body: JSON.stringify({ name: name }) });
            },
            rename: (id, name) => {
                return new JsonPutFetch(`/api/playlist/${deviceId}/rename/${id}`, null, { body: JSON.stringify({ name: name }) });
            },
            remove: ids => {
                return new JsonDeleteFetch(`/api/playlist/${deviceId}/remove`, null, { body: JSON.stringify(ids) });
            },
            copy: id => {
                return new JsonFetch(`/api/playlist/${deviceId}/copy/${id}`, null, { method: "COPY" });
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