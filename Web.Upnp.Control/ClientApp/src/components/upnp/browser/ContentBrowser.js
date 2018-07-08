import React from "react";
import { withRouter } from "react-router-dom";
import DataView from "../../DataView";
import Breadcrumbs from "./Breadcrumbs";
import Pagination from "./Pagination";
import DIDLItem from "./DIDLItem";
import TableView from "./TableView";
import { QString } from "../../Utils";

class Browser extends React.Component {

    navigateHandler = event => {
        const id = event.currentTarget.dataset.id;
        this.navigateToItem(id);
    }

    navigateTo = (location) => this.props.history.push(location);

    navigateBack = () => this.props.history.goBack();

    navigateToItem = (id) => {
        if (id !== "-1")
            this.navigateTo(`${this.props.baseUrl}/${this.props.device}/${id}`);
        else
            this.navigateTo(this.props.baseUrl);
    }

    render() {
        const { device, id, baseUrl, match: { url }, location: { search: qstring } } = this.props;
        const { p: page = 1, s: size = 50 } = QString.parse(qstring);
        return <DataView dataUri={`/api/browse/${device}/${id}?withParents=true&take=${size}&skip=${(page - 1) * size}`}
            selector={data => data.result}
            headerTemplate={Breadcrumbs} headerProps={{ baseUrl: `${baseUrl}/${device}` }}
            containerTemplate={TableView} containerProps={{ navigateHandler: this.navigateHandler }}
            itemTemplate={DIDLItem} itemProps={{ onDoubleClick: this.navigateHandler }}
            footerTemplate={Pagination} footerProps={{ baseUrl: url, page: parseInt(page), size: parseInt(size) }} />;
    }
}

const ContentBrowser = withRouter(Browser);

export default ContentBrowser; 