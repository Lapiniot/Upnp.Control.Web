import React from "react";
import DataView from "../../DataView";
import Breadcrumb from "./Breadcrumb";
import Pagination from "./Pagination";
import DIDLItem from "./DIDLItem";
import TableView from "./TableView";
import { QString } from "../../Extensions";

class AbstractBrowser extends React.Component {

    navigateHandler = event => {
        const id = event.currentTarget.dataset.id;
        this.navigateToItem(id);
    }

    navigateTo = (location) => {
        this.props.history.push(location);
    }

    navigateBack = () => {
        this.props.history.goBack();
    }

    navigateToItem = (id) => {
        if (id !== "-1")
            this.navigateTo(`${this.props.baseUrl}/${this.props.device}/${id}`);
        else
            this.navigateTo(this.props.baseUrl);
    }

    render() {
        console.log(this.props);
        const { device, id, baseUrl, match: { url }, location: { search: qstring },
            headerTemplate: HeaderTemplate, containerTemplate: ContainerTemplate,
            itemTemplate: ItemTemplate, footerTemplate: FooterTemplate } = this.props;
        const { p: page = 1, s: size = 50 } = QString.parse(qstring);
        const context = {
            urls: { current: url, base: baseUrl, root: `${baseUrl}/${device}` },
            page: parseInt(page),
            size: parseInt(size),
            navigateHandler: this.navigateHandler
        };
        console.log(context);
        return <DataView dataUri={`/api/browse/${device}/${id}?withParents=true&take=${size}&skip=${(page - 1) * size}`}
                         selector={data => data.result}
                         headerTemplate={HeaderTemplate} headerProps={context}
                         containerTemplate={ContainerTemplate} containerProps={context}
                         itemTemplate={ItemTemplate} itemProps={context}
                         footerTemplate={FooterTemplate} footerProps={context} />;
    }
}

export class Browser extends React.Component {
    render() {
        return <AbstractBrowser {...this.props}
                   headerTemplate={Breadcrumb}
                   containerTemplate={TableView}
                   itemTemplate={DIDLItem}
                   footerTemplate={Pagination} />;
    }
}

export class PlaylistBrowser extends React.Component {
    render() {
        return <AbstractBrowser {...this.props}
                   containerTemplate={TableView}
                   itemTemplate={DIDLItem}
                   footerTemplate={Pagination} />;
    }
}