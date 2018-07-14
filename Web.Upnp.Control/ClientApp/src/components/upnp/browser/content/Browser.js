import React from "react";
import { OnlineContentBrowserView } from "../ContentBrowser";
import ContentTableView from "../ContentTableView";
import DIDLItemRow, { DefaultCells } from "../DIDLItemRow";
import LevelUpRow from "../LevelUpRow";
import Breadcrumb from "../Breadcrumb";
import Pagination from "../Pagination";

class ContentTableHeader extends React.Component {
    render() {
        return (<React.Fragment>
            <div>Name</div>
            <div>Kind</div>
        </React.Fragment>);
    }
}

class LevelUp extends React.Component {
    render() {
        return <LevelUpRow {...this.props}>
            <div>...</div>
            <div>Parent</div>
        </LevelUpRow>
    }
}

class Item extends React.Component {
    render() {
        return <DIDLItemRow {...this.props}>
            <DefaultCells {...this.props} />
        </DIDLItemRow>;
    }
}

class ContentBrowserTableView extends React.Component {
    render() {
        return <ContentTableView headerTemplate={ContentTableHeader} injectStart={LevelUp} {...this.props} />
    }
}

export default class Browser extends React.Component {
    render() {
        return <OnlineContentBrowserView
            headerTemplate={Breadcrumb}
            containerTemplate={ContentBrowserTableView}
            itemTemplate={Item}
            footerTemplate={Pagination}
            {...this.props} />;
    }
}