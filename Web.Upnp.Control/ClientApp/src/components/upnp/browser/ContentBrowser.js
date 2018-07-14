import React from "react";
import DataView from "../../DataView";
import LoadIndicator from "../../LoadIndicator";
import { withDataFetch } from "../../Extensions";
import { withNavigationContext } from "./Navigator";

export class ContentBrowserView extends React.Component {
    render() {
        const { context, ...other } = this.props;
        return <DataView headerProps={context} containerProps={context} itemProps={context} footerProps={context}
            selector={d => d.result} {...other} />;
    }
}

export const OnlineContentBrowserView = withNavigationContext(withDataFetch(ContentBrowserView,
    { template: LoadIndicator },
    ({ device, id, context: { size, page } }) => {
        return `/api/browse/${device}/${id}?withParents=true&take=${size}&skip=${(page - 1) * size}`;
    }));