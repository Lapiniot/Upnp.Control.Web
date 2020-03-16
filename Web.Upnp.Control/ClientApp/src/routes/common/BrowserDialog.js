import React from "react";
import { MemoryRouter, Switch, Route, Redirect } from "react-router-dom";
import { withMatchProps } from "../../components/Extensions";
import Modal from "../../components/Modal";
import LoadIndicator from "../../components/LoadIndicator";
import Pagination from "./Pagination";
import DeviceIcon from "../common/DeviceIcon";
import { RouteLink } from "../../components/NavLink";
import { withProps, withDataFetch } from "../../components/Extensions";
import { withBrowserCore } from "../common/BrowserCore";
import Breadcrumb from "../common/Breadcrumb";
import BrowserCoreSelectable from "../common/BrowserWithSelection";
import $api from "../../components/WebApi";
import SelectionService from "../../components/SelectionService";

export default class BrowserDialog extends React.Component {

    displayName = BrowserDialog.name;

    constructor(props) {
        super(props);
        this.state = { selection: { keys: [] } };
        this.selection = new SelectionService();
        this.selection.addEventListener('changed', e => {
            const { target: selection, detail: { device } = {} } = e;
            e.preventDefault();
            this.setState({ selection: selection, device: device });
        });
        this.browser = withMatchProps(Browser, { baseUrl: "/sources/browse", selection: this.selection });
        this.sourcePicker = withProps(withDataFetch(MediaSourceList, { template: LoadIndicator }), { dataUrl: $api.discover("servers").url() });
    }

    confirm = () => !!this.props.onConfirm && this.props.onConfirm(this.state.selection);

    getSelectionData = () => [this.state.device, Array.from(this.state.selection.keys)];

    render() {
        const { id, title, confirmText = "OK", ...other } = this.props;
        return <Modal id={id} title={title} {...other} data-keyboard={true}>
            <Modal.Body className="p-0 d-flex flex-column">
                <MemoryRouter initialEntries={["/sources"]} initialIndex={0}>
                    <Switch>
                        <Route path="/sources" exact component={this.sourcePicker} />
                        <Route path="/sources/browse" exact render={() => <Redirect to="/sources" />} />
                        <Route path="/sources/browse/:device/:id(.*)?" component={this.browser} />
                    </Switch>
                </MemoryRouter>
            </Modal.Body>
            <Modal.Footer>
                {(typeof (this.props.children) === 'function' ? this.props.children(this) : this.props.children) ??
                    <React.Fragment>
                        <Modal.Button key="confirm" text={confirmText} className="btn-primary" disabled={this.selection.any()} onClick={this.confirm} dismiss />
                        <Modal.Button key="cancel" text="Cancel" className="btn-secondary" dismiss />
                    </React.Fragment>}
            </Modal.Footer>
        </Modal>;
    }
};

const MediaSourceList = ({ dataContext: { source: data } }) =>
    <ul className="list-group list-group-flush">
        {[data.map(({ udn, name, type, description, icons }, i) => {
            return <RouteLink key={i} to={`/sources/browse/${udn}`} className="list-group-item list-group-item-action">
                <DeviceIcon icon={icons.find(i => i.w <= 48)} alt={name} service={type} />
                {name}{description && ` (${description})`}
            </RouteLink>;
        })]}
    </ul>;

const BrowserView = ({ dataContext, navContext: { page, pageSize, urls, navigateHandler },
    dataContext: { source: { total, result: { length: fetched }, parents } }, ...other }) =>
    <div>
        <Breadcrumb dataContext={parents} baseUrl={urls.root} />
        <BrowserCoreSelectable dataContext={dataContext} filter={i => i.class.endsWith(".musicTrack")} navigateHandler={navigateHandler} {...other} />
        <Pagination count={fetched} total={total} baseUrl={urls.current} current={page} size={pageSize} />
    </div>;

const Browser = withBrowserCore(BrowserView);