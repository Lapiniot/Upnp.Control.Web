import { useCallback } from "react";
import { useDataFetch } from "../../components/DataFetch";
import WebApi, { BrowseOptions } from "../../components/WebApi";
import { useNavigator } from "../../components/Navigator";
import Settings from "./Settings";
import { BrowseFetchResult } from "./Types";

function parse(value: string | number | undefined): number | undefined {
    switch (typeof value) {
        case "number": return value;
        case "string": return parseInt(value);
        default: return undefined;
    }
}

const browseFetchOptions = { withParents: true, withResourceProps: true };

type ContentBrowserParamKey = "device" | "id" | "s" | "p";

function fetchContent(device: string, id?: string | undefined,
    pageSize?: string | undefined, page?: string | undefined,
    options: BrowseOptions = browseFetchOptions):
    Promise<BrowseFetchResult> {

    if (!device) throw new Error("Missing value for mandatory parameter 'device'");
    const s = parse(pageSize) ?? Settings.get("pageSize") ?? 50;
    const p = parse(page) ?? 1;
    return WebApi.browse(device).get(id).take(s).skip((p - 1) * s).withOptions(options).json();
}

export function useContentBrowser(options?: BrowseOptions, defaults?: { [K in ContentBrowserParamKey]?: string }) {
    const { navigate, params } = useNavigator<ContentBrowserParamKey>();
    const { device, id, s, p } = { ...defaults, ...params };
    const loader = useCallback(() => fetchContent(device as string, id, s, p, options), [device, id, s, p]);
    const data = useDataFetch(loader);
    return { ...data, navigate, params };
}