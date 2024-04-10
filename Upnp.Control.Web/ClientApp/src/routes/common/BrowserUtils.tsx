import { useDataFetch } from "../../hooks/DataFetch";
import { useNavigator } from "../../hooks/Navigator";
import WebApi, { BrowseOptions } from "../../services/WebApi";
import Settings from "./Settings";

const browseFetchOptions = { withParents: true, withResourceProps: true };

type ContentBrowserParamKey = "device" | "id" | "s" | "p";

async function fetchContentAsync(device: string, id: string | undefined, take: number, options: BrowseOptions = browseFetchOptions) {
    const data = await WebApi.browse(device).get(id).take(take).withOptions(options).json();
    return data.items && data.items.length > 0 ? {
        data,
        continuation() { return fetchNext(device, id, take, take) }
    } : {
        data,
        merge(fetched: Upnp.BrowseFetchResult, _: Upnp.BrowseFetchResult) { return fetched; }
    };

    async function fetchNext(device: string, id: string | undefined, skip: number, take: number) {
        const data = await WebApi.browse(device).get(id).take(take).skip(skip).withOptions(
            { ...options, withDevice: false, withParents: false, withMetadata: false }).json();
        const fetched = data.items?.length ?? 0;
        const continuation = fetched === take
            ? function () { return fetchNext(device, id, skip + fetched, take) }
            : undefined;
        return { data, merge, continuation };
    }

    function merge(current: Upnp.BrowseFetchResult, fetched: Upnp.BrowseFetchResult): Upnp.BrowseFetchResult {
        return { ...current, ...fetched, items: [...current.items!, ...fetched.items!] };
    }
}

type ParamDefaults = { [K in Exclude<ContentBrowserParamKey, "device">]?: string }

export function useContentBrowser(options?: BrowseOptions, defaults?: ParamDefaults) {
    const { navigate, params: { "*": path, id, ...params } } = useNavigator<ContentBrowserParamKey | "*">();
    const merged = { ...defaults, ...params, id: id ?? (path || undefined) ?? defaults?.id };
    const { device, id: itemId } = merged;
    const data = useDataFetch(fetchContentAsync, device!, itemId, Settings.get("pageSize"), options);
    return { ...data, navigate, params: merged };
}