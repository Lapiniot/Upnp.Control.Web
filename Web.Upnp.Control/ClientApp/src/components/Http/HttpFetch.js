import qs from "./QueryString";

export class UrlBuilder {
    constructor(path, query) {
        this.path = path;
        this.query = query;
    }

    url() {
        return this.query ? this.path + qs.build(this.query) : this.path;
    }
}

export class HttpFetch extends UrlBuilder {
    constructor(path, query, init) {
        super(path, query);
        this.init = { method: "GET", ...init };
    }

    fetch() {
        return fetch(this.url(), this.init);
    }
}

export class HttpPost extends HttpFetch {
    constructor(path, query, init) {
        super(path, query, { ...init, method: "POST" });
    }
}

export class HttpPut extends HttpFetch {
    constructor(path, query, init) {
        super(path, query, { ...init, method: "PUT" });
    }
}

export class HttpDelete extends HttpFetch {
    constructor(path, query, init) {
        super(path, query, { ...init, method: "DELETE" });
    }
}

export class JsonFetch extends HttpFetch {
    constructor(path, query, init) {
        const { headers, ...other } = init;
        super(path, query, { headers: { ...headers, "Accept": "application/json" }, ...other });
    }
}

export class JsonWithBodyFetch extends JsonFetch {
    constructor(path, query, init) {
        const { headers, ...other } = init;
        super(path, query, { headers: { ...headers, "Content-Type": "application/json" }, ...other });
    }
}

export class JsonPostFetch extends JsonWithBodyFetch {
    constructor(path, query, init) {
        super(path, query, { ...init, method: "POST" });
    }
}

export class JsonPutFetch extends JsonWithBodyFetch {
    constructor(path, query, init) {
        super(path, query, { ...init, method: "PUT" });
    }
}

export class JsonDeleteFetch extends JsonWithBodyFetch {
    constructor(path, query, init) {
        super(path, query, { ...init, method: "DELETE" });
    }
}