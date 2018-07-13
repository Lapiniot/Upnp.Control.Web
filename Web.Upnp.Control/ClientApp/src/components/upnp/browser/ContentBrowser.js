import React from "react";
import DataView from "../../DataView";
import Breadcrumb from "./Breadcrumb";
import Pagination from "./Pagination";
import DIDLItem from "./DIDLItem";
import TableView from "./TableView";
import LoadIndicator from "../../LoadIndicator";
import { QString, withDataFetch } from "../../Extensions";

function withNavigationContext(Component) {
    return class extends React.Component {

        displayName = withNavigationContext.name + "(" + Component.name + ")";

        navigateHandler = event => {
            const id = event.currentTarget.dataset.id;
            this.navigateToItem(id);
        }

        navigateTo = (location) => {
            this.props.history.push(location);
        }

        navigateToItem = (id) => {
            if (id !== "-1")
                this.navigateTo(`${this.props.baseUrl}/${this.props.device}/${id}`);
            else
                this.navigateTo(this.props.baseUrl);
        }

        render() {
            const { device, baseUrl, match: { url }, location: { search: qstring } } = this.props;
            const { p: page = 1, s: size = 50 } = QString.parse(qstring);
            const context = {
                urls: { current: url, base: baseUrl, root: `${baseUrl}/${device}` },
                page: parseInt(page),
                size: parseInt(size),
                navigateHandler: this.navigateHandler
            };

            return <Component context={context} {...this.props} />;
        }
    };
}

class ContentView extends React.Component {
    render() {
        const { context, ...other } = this.props;
        return <DataView
                   headerTemplate={Breadcrumb} headerProps={context}
                   containerTemplate={TableView} containerProps={context}
                   itemTemplate={DIDLItem} itemProps={context}
                   footerTemplate={Pagination} footerProps={context}
                   {...other} selector={d => d.result} />;
    }
}

const OnlineContentView = withNavigationContext(withDataFetch(ContentView,
    { template: LoadIndicator },
    ({ device, id, context: { size, page } }) => {
        return `/api/browse/${device}/${id}?withParents=true&take=${size}&skip=${(page - 1) * size}`;
    }));

export class Browser extends React.Component {
    render() {
        return <OnlineContentView {...this.props} />;
    }
}

export class PlaylistBrowser extends React.Component {
    render() {
        return <OnlineContentView {...this.props} headerTemplate={null} />;
    }
}