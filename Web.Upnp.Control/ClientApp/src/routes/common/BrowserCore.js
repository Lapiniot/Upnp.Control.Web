import React from "react";
import { withRouter } from "react-router-dom";
import { withDataFetch } from "../../components/Extensions";
import { withNavigationContext } from "./Navigator";
import LoadIndicator from "../../components/LoadIndicator";
import $api from "../../components/WebApi";

export function renderWithDeviceProps(Component, extra = {}) {
    return function ({ match: { params: { device, id = "" } } }) {
        return <Component device={device} id={id} {...extra} />;
    };
}

export function withMatchProps(Component, extra = {}) {
    return function ({ match: { params } = {} }) {
        return <Component {...params} {...extra} />
    }
}

export class DIDLUtils {
    static getKind(upnpClassName) {
        const index = upnpClassName.lastIndexOf(".");
        return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
    }
}

export function withBrowserCore(BrowserView) {
    return withRouter(
        withNavigationContext(
            withDataFetch(BrowserView,
                { template: LoadIndicator },
                ({ device, id, navContext: { pageSize, page } }) => {
                    return $api.browse(device).get(id).withParents().take(pageSize).skip((page - 1) * pageSize).url();
                })));
}