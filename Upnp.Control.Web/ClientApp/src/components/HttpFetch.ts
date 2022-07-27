﻿export type RequestQuery = { [key: string]: any } | undefined | null;

async function fetch(url: string, init?: RequestInit, timeout?: number) {
    const controller = new AbortController();
    // TODO: Consider using AbortController.timeout() when it finally comes to Safari
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        return await globalThis.fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

export class UrlBuilder {
    protected path;
    protected query;

    constructor(path: string, query?: RequestQuery) {
        this.path = path;
        this.query = query;
    }

    url() {
        const search = this.query && new URLSearchParams(this.query).toString();
        return search && search.length > 0 ? this.path + "?" + search : this.path;
    }
}

export class HttpFetch extends UrlBuilder {
    protected init?: RequestInit;
    protected timeout?: number;

    constructor(path: string, query?: RequestQuery, init?: RequestInit) {
        super(path, query);
        this.init = { method: "GET", ...init };
    }

    fetch(requestTimeout?: number | undefined) {
        const timeout = requestTimeout ?? this.timeout;
        if (typeof timeout === "number" && timeout > 0) {
            return fetch(this.url(), this.init, timeout);
        }
        else {
            return globalThis.fetch(this.url(), this.init);
        }
    }

    withTimeout(timeout: number) {
        const { constructor } = this;
        const speciesConstructor = (<any>constructor)[Symbol.species];
        const instance = new (speciesConstructor ?? constructor)(this.path, this.query, this.init);
        instance.timeout = timeout;
        return <this>instance;
    }
}

export class HttpPostFetch extends HttpFetch {
    constructor(path: string, query: RequestQuery, init: RequestInit) {
        super(path, query, { ...init, method: "POST" });
    }
}

export class HttpPutFetch extends HttpFetch {
    constructor(path: string, query: RequestQuery, init: RequestInit) {
        super(path, query, { ...init, method: "PUT" });
    }
}

export class HttpDeleteFetch extends HttpFetch {
    constructor(path: string, query: RequestQuery, init?: RequestInit) {
        super(path, query, { ...init, method: "DELETE" });
    }
}

export class JsonHttpFetch<T> extends HttpFetch {
    constructor(path: string, query?: RequestQuery, init?: RequestInit) {
        const { headers, ...other } = init ?? {};
        super(path, query, { headers: { ...headers, "Accept": "application/json" }, ...other });
    }

    async json(requestTimeout?: number | undefined) {
        const response = await this.fetch(requestTimeout);
        return await response.json() as T;
    }
}