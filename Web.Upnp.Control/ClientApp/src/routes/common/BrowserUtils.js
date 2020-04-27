import { withDataFetch } from "../../components/DataFetch";
import withNavigation from "./Navigator";
import LoadIndicator from "../../components/LoadIndicator";
import $api from "../../components/WebApi";
import $config from "./Config";

const defaultUrlBuilder = ({ device, id, p, s }) => {
    const size = parseInt(s) || $config.pageSize;
    const page = parseInt(p) || 1;
    return $api.browse(device).get(id).withParents().take(size).skip((page - 1) * size).url();
};

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

export function withBrowser(BrowserComponent, usePreloader = true, dataUrlBuilder = defaultUrlBuilder) {
    return withNavigation(withDataFetch(BrowserComponent, { template: LoadIndicator, usePreloader }, dataUrlBuilder));
}