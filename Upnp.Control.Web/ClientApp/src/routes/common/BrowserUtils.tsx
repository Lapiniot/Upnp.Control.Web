import { useDataFetch } from "../../hooks/DataFetch";
import { useNavigator } from "../../hooks/Navigator";
import WebApi, { BrowseOptions } from "../../services/WebApi";
import Settings from "./Settings";

function parse(value: string | number | undefined): number | undefined {
    switch (typeof value) {
        case "number": return value;
        case "string": return parseInt(value);
        default: return undefined;
    }
}

const browseFetchOptions = { withParents: true, withResourceProps: true };

type ContentBrowserParamKey = "device" | "id" | "s" | "p";

function fetchContentAsync(device: string, id?: string, pageSize?: string, page?: string,
    options: BrowseOptions = browseFetchOptions): Promise<Upnp.BrowseFetchResult> {
    const s = parse(pageSize) ?? Settings.get("pageSize") ?? 50;
    const p = parse(page) ?? 1;
    return WebApi.browse(device).get(id).take(s).skip((p - 1) * s).withOptions(options).json();
}

type ParamDefaults = { [K in Exclude<ContentBrowserParamKey, "device">]?: string }

export function useContentBrowser(options?: BrowseOptions, defaults?: ParamDefaults) {
    const { navigate, params: { "*": path, id, ...params } } = useNavigator<ContentBrowserParamKey | "*">();
    const merged = { ...defaults, ...params, id: id ?? (path || undefined) ?? defaults?.id };
    const { device, id: itemId, s, p } = merged;
    const data = useDataFetch(fetchContentAsync, device!, itemId, s, p, options);
    return { ...data, navigate, params: merged };
}