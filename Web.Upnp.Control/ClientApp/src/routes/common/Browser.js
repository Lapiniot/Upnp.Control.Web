import React from "react";
import { withRouter } from "react-router-dom"
import { OnlineContentBrowserView } from "./ContentBrowser";
import ContentTableView from "./ContentTableView";
import DIDLItemRow, { DefaultCells } from "./DIDLItemRow";
import LevelUpRow from "./LevelUpRow";
import Breadcrumb from "./Breadcrumb";
import Pagination from "./Pagination";

class ContentTableHeader extends React.Component {
    render() {
        return (<React.Fragment>
                    <div>Name</div>
                    <div className="x-table-cell-min">Kind</div>
                </React.Fragment>);
    }
}

class LevelUp extends React.Component {
    render() {
        return <LevelUpRow {...this.props}>
                   <div>...</div>
                   <div>Parent</div>
               </LevelUpRow>;
    }
}

class Item extends React.Component {
    render() {
        const { "data-source": data, navcontext: { navigateHandler }, ...other } = this.props;
        return <DIDLItemRow id={data.id} onDoubleClick={navigateHandler} {...other}>
                   <DefaultCells {...this.props} />
               </DIDLItemRow>;
    }
}

class ContentBrowserTableView extends React.Component {
    render() {
        return <ContentTableView headerTemplate={ContentTableHeader} injectStart={LevelUp} {...this.props} />;
    }
}

export class Browser extends React.Component {
    render() {
        return <OnlineContentBrowserView
                   headerTemplate={Breadcrumb}
                   containerTemplate={ContentBrowserTableView}
                   itemTemplate={Item}
                   footerTemplate={Pagination}
                   {...this.props} />;
    }
}

export const RoutedBrowser = withRouter(Browser);

export function renderWithDeviceProps(Component, props) {
    return function({ match: { params: { device, id = "" } } }) {
        return <Component device={device} id={id} {...props} />;
    };
}