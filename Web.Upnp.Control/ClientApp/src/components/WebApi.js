import { QString } from "./Extensions";

export default class {
    static discover = function(category) {
        return Object.assign(Object.create(fetchImpl), { path: `/api/discovery/${category}`, query: {} });
    }

    static browse(deviceId) {
        return {
            get: (id = "") => {
                return Object.assign(Object.create(browseImpl), { path: `/api/browse/${deviceId}/${id}`, query: {} });
            },
            parents: id => {
                return Object.assign(Object.create(fetchImpl), { path: `/api/browse/parents/${deviceId}/${id}` });
            },
            metadata: id => {
                return Object.assign(Object.create(fetchImpl), { path: `/api/browse/metadata/${deviceId}/${id}` });
            }
        };
    }

    static playlist(deviceId) {
        return {
            add: name => { return null },
            rename: (id, name) => { return null },
            remove: ids => { return null },
            copy: id => { return null }
        };
    }
}


export const getUrlImpl = {
    url: function() {
        return this.path + QString.build(this.query);
    }
};

export const fetchImpl = Object.assign({
        fetch: function() {
            return fetch(this.url());
        }
    },
    getUrlImpl);

export const browseImpl = Object.assign({
        withParents: function() {
            return Object.assign(Object.create(browseImpl), { path: this.path, query: { ...this.query, withParents: true } });
        },
        take: function(count) {
            return Object.assign(Object.create(browseImpl), { path: this.path, query: { ...this.query, take: count } });
        },
        skip: function(count) {
            return Object.assign(Object.create(browseImpl), { path: this.path, query: { ...this.query, skip: count } });
        }
    },
    fetchImpl);