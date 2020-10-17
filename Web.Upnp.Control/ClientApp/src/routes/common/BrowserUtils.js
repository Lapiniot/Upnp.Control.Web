import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import withNavigation from "./Navigator";
import LoadIndicator from "../../components/LoadIndicator";
import $api from "../../components/WebApi";
import $config from "./Config";

export class DIDLUtils {
    static getKind(upnpClassName) {
        const index = upnpClassName.lastIndexOf(".");
        return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
    }

    static getDisplayName(upnpClassName) {
        const kind = DIDLUtils.getKind(upnpClassName);
        if (kind.endsWith("Container"))
            return kind.substring(0, kind.length - 9);
        else
            return kind;
    }
}

export function fromBaseQuery(baseFetchQuery) {
    return ({ device, id, p, s }) => {
        const size = parseInt(s) || $config.pageSize;
        const page = parseInt(p) || 1;
        const key = `${device}!${id ?? ""}!${p ?? ""}!${s ?? ""}`;
        return withMemoKey(baseFetchQuery(device, id).take(size).skip((page - 1) * size).fetch, key);
    }
}

const defaultQueryBuilder = fromBaseQuery((device, id) => $api.browse(device).get(id).withParents());

export function withBrowser(BrowserComponent, usePreloader = true, builder = defaultQueryBuilder) {
    return withNavigation(withDataFetch(BrowserComponent, { template: LoadIndicator, usePreloader }, builder));
}