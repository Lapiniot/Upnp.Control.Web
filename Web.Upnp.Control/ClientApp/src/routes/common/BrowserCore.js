import { withDataFetch } from "../../components/DataFetch";
import withNavigation from "./Navigator";
import LoadIndicator from "../../components/LoadIndicator";
import $ from "../../components/WebApi";
import $config from "../common/Config";

const defaultUrlBuilder = ({ device, id, p, s }) => {
    const size = parseInt(s) || $config.pageSize;
    const page = parseInt(p) || 1;
    return $.browse(device).get(id).withParents().take(size).skip((page - 1) * size).url();
}

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

export function withBrowserCore(BrowserView, usePreloader = true, dataUrlBuilder = defaultUrlBuilder) {
    return withNavigation(withDataFetch(BrowserView, { template: LoadIndicator, usePreloader }, dataUrlBuilder));
}