import React from "react";
import DataView from "../../DataView";
import LoadIndicator from "../../LoadIndicator";
import { withDataFetch } from "../../Extensions";
import { withNavigationContext } from "./Navigator";

export class ContentBrowserView extends React.Component {
    render() {
        const { navcontext, headerProps, containerProps, itemProps, footerProps, ...other } = this.props;

        return <DataView headerProps={{ navcontext, ...headerProps }}
            containerProps={{ navcontext, ...containerProps }}
            itemProps={{ navcontext, ...itemProps }}
            footerProps={{ navcontext, ...footerProps }}
            selector={d => d.result} {...other} />;
    }
}

export const OnlineContentBrowserView = withNavigationContext(withDataFetch(ContentBrowserView,
    { template: LoadIndicator },
    ({ device, id, navcontext: { size, page } }) => {
        return `/api/browse/${device}/${id}?withParents=true&take=${size}&skip=${(page - 1) * size}`;
    }));

export function navigatedDataView(WrappedComponent) {
    return withNavigationContext(withDataFetch(WrappedComponent,
        { template: LoadIndicator },
        ({ device, id, navcontext: { size, page } }) => {
            return `/api/browse/${device}/${id}?withParents=true&take=${size}&skip=${(page - 1) * size}`;
        }));
}