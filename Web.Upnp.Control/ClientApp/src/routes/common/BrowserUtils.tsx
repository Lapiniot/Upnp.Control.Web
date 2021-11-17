import { DataFetchProps, withDataFetch, withMemoKey } from "../../components/DataFetch";
import withNavigation, { NavigatorProps } from "./Navigator";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import $api, { BrowseFetch } from "../../components/WebApi";
import { BrowseRouteParams, ViewRouteParams } from "./Types";
import { ComponentType } from "react";
import $s from "./Settings";

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
const defaultQueryBuilder = fromBaseQuery((device, id) => $api.browse(device).get(id).withOptions(browseFetchOptions));

export function withBrowserDataFetch<P extends DataFetchProps & NavigatorProps>(
    BrowserComponent: ComponentType<P>,
    usePreloader = true,
    builder = defaultQueryBuilder) {
    return withNavigation<Omit<P, keyof DataFetchProps> & BrowseRouteParams, BrowseRouteParams>(
        withDataFetch<P, BrowseRouteParams>(BrowserComponent, builder,
            { template: LoadIndicatorOverlay, usePreloader }));
}

const viewFetchOptions = { withParents: true, withMetadata: true, withResourceProps: true };
const defaultViewQueryBuilder = ({ device, id }: ViewRouteParams) => withMemoKey(
    $api.browse(device).get(id).withOptions(viewFetchOptions).jsonFetch, device + "|" + id);

export function withViewerDataFetch<P extends DataFetchProps>(ViewerComponent: ComponentType<P>, usePreloader = true,
    builder = defaultViewQueryBuilder) {
    return withDataFetch<P, ViewRouteParams>(ViewerComponent, builder, { template: LoadIndicatorOverlay, usePreloader });
}