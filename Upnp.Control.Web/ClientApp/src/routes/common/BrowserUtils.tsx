import { ComponentType } from "react";
import { DataFetchProps, withDataFetch, withMemoKey } from "../../components/DataFetch";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import $api, { BrowseFetch } from "../../components/WebApi";
import withNavigation, { NavigatorProps } from "./Navigator";
import $s from "./Settings";
import { BrowseRouteParams } from "./Types";

type FetchFunction = (device: string, id: string) => BrowseFetch;

function parse(value: string | number | undefined): number | undefined {
    switch (typeof value) {
        case "number": return value;
        case "string": return parseInt(value);
        default: return undefined;
    }
}

export function fromBaseQuery(baseFetchQuery: FetchFunction) {
    return ({ device, id, p, s }: BrowseRouteParams) => {
        const size = parse(s) ?? $s.get("pageSize");
        const page = parse(p) ?? 1;
        const key = `${device}!${id ?? ""}!${p ?? ""}!${s ?? ""}`;
        return withMemoKey(baseFetchQuery(device, id as string).take(size).skip((page - 1) * size).jsonFetch, key);
    }
}

const browseFetchOptions = { withParents: true, withResourceProps: true };
const defaultQueryBuilder = fromBaseQuery((device, id) => {
    return $api.browse(device).get(id).withOptions(browseFetchOptions);
});

export function withBrowserDataFetchNavigation<P extends DataFetchProps & NavigatorProps>(
    BrowserComponent: ComponentType<P>,
    usePreloader = true,
    builder = defaultQueryBuilder) {
    return withNavigation<Omit<P, keyof DataFetchProps> & BrowseRouteParams, BrowseRouteParams>(
        withDataFetch<P, BrowseRouteParams>(BrowserComponent, builder,
            { template: LoadIndicatorOverlay, usePreloader }));
}

export function withBrowserDataFetch<P extends DataFetchProps>(BrowserComponent: ComponentType<P>,
    usePreloader = true, builder = defaultQueryBuilder) {
    return withDataFetch<P, BrowseRouteParams>(BrowserComponent, builder, { template: LoadIndicatorOverlay, usePreloader });
}