export type RequestQuery = Record<string, string> | undefined

const fetch = "timeout" in AbortSignal
    ? function (url: string, init?: RequestInit, timeoutMilliseconds?: number) {
        const signal = timeoutMilliseconds ? AbortSignal.timeout(timeoutMilliseconds) : null;
        return globalThis.fetch(url, { ...init, signal });
    }
    : function (url: string, init?: RequestInit, timeoutMilliseconds?: number) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(new DOMException("The user aborted a request.", "AbortError")), timeoutMilliseconds);
        return globalThis.fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
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
        return search && search.length > 0 ? `${this.path}?${search}` : this.path;
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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