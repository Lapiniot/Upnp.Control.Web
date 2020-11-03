export class UrlBuilder {
    constructor(path, query) {
        this.path = path;
        this.query = query;
    }

    url = () => {
        const search = this.query && new URLSearchParams(this.query).toString();
        return search && search.length > 0 ? this.path + "?" + search : this.path;
    }
}

async function fetch(url, init, timeout) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        return await window.fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

export class HttpFetch extends UrlBuilder {
    constructor(path, query, init) {
        super(path, query);
        this.init = { method: "GET", ...init };
    }

    fetch = (requestTimeout) => {
        const timeout = requestTimeout ?? this.timeout;
        if (typeof timeout === "number" && timeout > 0) {
            return fetch(this.url(), this.init, timeout);
        }
        else {
            return window.fetch(this.url(), this.init);
        }
    }

    withTimeout(timeout) {
        const { constructor } = this;
        let instance = new (constructor[Symbol.species] ?? constructor)(this.path, this.query, this.init);
        instance.timeout = timeout;
        return instance;
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
    constructor(path, query, init = {}) {
        const { headers, ...other } = init;
        super(path, query, { headers: { ...headers, "Accept": "application/json" }, ...other });
    }
}

export class JsonWithBodyFetch extends JsonFetch {
    constructor(path, query, init = {}) {
        const { headers, ...other } = init;
        super(path, query, { headers: { ...headers, "Content-Type": "application/json" }, ...other });
    }
}

export class JsonPostFetch extends JsonWithBodyFetch {
    constructor(path, query, init = {}) {
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