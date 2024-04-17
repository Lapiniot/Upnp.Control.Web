import { JsonHttpFetch, RequestQuery } from "./HttpFetch";
import { BrowseOptions, BrowseOptionFlags } from "./WebApi";


export class BrowseFetch extends JsonHttpFetch<Upnp.BrowseFetchResult> {
    constructor(path: string, query?: RequestQuery) {
        super(path, query);
    }

    withParents() { return new BrowseFetch(this.path, { ...this.query, withParents: "true" }); }

    withResource() { return new BrowseFetch(this.path, { ...this.query, withResourceProps: "true" }); }

    withVendor() { return new BrowseFetch(this.path, { ...this.query, withVendorProps: "true" }); }

    withMetadata() { return new BrowseFetch(this.path, { ...this.query, withMetadata: "true" }); }

    withDevice() { return new BrowseFetch(this.path, { ...this.query, withDevice: "true" }); }

    withOptions(options: BrowseOptions) {
        const query = { ...this.query };
        for (const key in options)
            query[key] = String(options[key as BrowseOptionFlags]);
        return new BrowseFetch(this.path, query);
    }

    take(count: number) { return new BrowseFetch(this.path, { ...this.query, take: count.toString() }); }

    skip(count: number) { return new BrowseFetch(this.path, { ...this.query, skip: count.toString() }); }
}