import { useDataFetch } from "../../hooks/DataFetch";
import { useNavigator } from "../../hooks/Navigator";
import { BrowseFetch } from "../../services/BrowseFetch";
import WebApi, { BrowseOptions } from "../../services/WebApi";
import Settings from "./Settings";

const fetchOptions = { withParents: true, withResourceProps: true } as BrowseOptions;
const minimalFetchOptions = { withDevice: false, withParents: false, withMetadata: false } as BrowseOptions;

type ContentBrowserParamKey = "device" | "id" | "s" | "p" | "q";

async function fetchContentAsync(device: string, id: string | undefined, criteria: string | undefined,
    take: number, options: BrowseOptions = fetchOptions) {
    const baseQuery = criteria ? WebApi.browse(device).search(id, `dc:title contains "${criteria}"`) : WebApi.browse(device).get(id);
    const data = await baseQuery.take(take).withOptions(options).json();
    return data.items && data.items.length > 0 ? {
        data,
        continuation() { return fetchNext(baseQuery.withOptions({ ...options, ...minimalFetchOptions }), take, take) }
    } : {
        data
    };

    async function fetchNext(query: BrowseFetch, skip: number, take: number) {
        const data = await query.take(take).skip(skip).json();
        const fetched = data.items?.length ?? 0;
        const continuation = fetched === take
            ? function () { return fetchNext(query, skip + fetched, take) }
            : undefined;
        return { data, merge, continuation };
    }

    function merge(current: Upnp.BrowseFetchResult, fetched: Upnp.BrowseFetchResult): Upnp.BrowseFetchResult {
        return { ...current, ...fetched, items: [...current.items!, ...fetched.items!] };
    }
}

type ParamDefaults = { [K in Exclude<ContentBrowserParamKey, "device">]?: string }

export function useContentBrowser(options?: BrowseOptions, defaults?: ParamDefaults) {
    const { navigate, params } = useNavigator<ContentBrowserParamKey | "*">();
    const merged = { ...defaults, ...params };
    const { device, id: itemId, q: criteria } = merged;
    const data = useDataFetch(fetchContentAsync, device!, itemId, criteria, Settings.get("pageSize"), options);
    return { ...data, navigate, params: merged };
}