import { useDataFetch } from "../../components/DataFetch";
import { useNavigator } from "../../components/Navigator";
import WebApi, { BrowseOptions } from "../../components/WebApi";
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

export function useContentBrowser(options?: BrowseOptions, defaults?: { [K in ContentBrowserParamKey]?: string }) {
    const { navigate, params } = useNavigator<ContentBrowserParamKey>();
    const { device, id: itemId, ["*"]: reminder = undefined, s, p } = { ...defaults, ...params };
    const id = (itemId && reminder) ? `${itemId}/${reminder}` : itemId;
    const data = useDataFetch(fetchContentAsync, device!, id, s, p, options);
    return { ...data, navigate, params: { ...params, id } };
}