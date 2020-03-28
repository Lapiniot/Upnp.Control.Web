import { withRouter } from "react-router-dom";
import { withDataFetch } from "../../components/Extensions";
import { withNavigationContext } from "./Navigator";
import LoadIndicator from "../../components/LoadIndicator";
import $ from "../../components/WebApi";

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

export function withBrowserCore(BrowserView, usePreloader = true) {
    return withRouter(
        withNavigationContext(
            withDataFetch(BrowserView,
                { template: LoadIndicator, usePreloader: usePreloader },
                ({ device, id, navContext: { pageSize, page } }) =>
                    $.browse(device).get(id).withParents().take(pageSize).skip((page - 1) * pageSize).url())));
}