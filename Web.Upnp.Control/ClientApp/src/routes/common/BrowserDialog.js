import React from "react";
import { MemoryRouter, Switch, Route, Redirect } from "react-router-dom";
import { withMatchProps } from "../../components/Extensions";
import Modal from "../../components/Modal";
import LoadIndicator from "../../components/LoadIndicator";
import Pagination from "./Pagination";
import DeviceIcon from "../common/DeviceIcon";
import { RouteLink } from "../../components/NavLink";
import { withProps, withDataFetch } from "../../components/Extensions";
import { withBrowserCore} from "../common/BrowserCore";
import Breadcrumb from "../common/Breadcrumb";
import BrowserCoreSelectable from "../common/BrowserWithSelection";
import $api from "../../components/WebApi";

export default class BrowserDialog extends React.Component {

    displayName = BrowserDialog.name;

    constructor(props) {
        super(props);
        this.state = { selection: { keys: [] } };
        this.browserComponent = withMatchProps(Browser, {
            baseUrl: "/sources/browse",
            onSelectionChanged: (selection, device, id) => {
                this.setState({ selection: { device: device, id: id, keys: Array.from(selection.keys) } });
                return true;
            }
        });
    }

    render() {
        const { id, title, confirmText = "OK", onConfirm, ...other } = this.props;
        const onConfirmWrapper = () => { if (onConfirm) onConfirm(this.state.selection) };
        return <Modal id={id} title={title} {...other}>
            <Modal.Body className="p-0 d-flex flex-column">
                <MemoryRouter initialEntries={["/sources"]} initialIndex={0}>
                    <Switch>
                        <Route path="/sources" exact component={MediaSourcePicker} />
                        <Route path="/sources/browse" exact render={() => <Redirect to="/sources" />} />
                        <Route path="/sources/browse/:device/:id(.*)?" render={this.browserComponent} />
                    </Switch>
                </MemoryRouter>
            </Modal.Body>
            <Modal.Footer>
                <Modal.Button key="confirm" text={confirmText} className="btn-primary"
                    disabled={this.state.selection.keys.length === 0} onClick={onConfirmWrapper} dismiss />
                <Modal.Button key="cancel" text="Cancel" className="btn-secondary" dismiss />
            </Modal.Footer>
        </Modal>;
    }
}

class MediaSourceList extends React.Component {
    render() {
        const { dataContext: { source: data } } = this.props;
        return <ul className="list-group list-group-flush">
            {[data.map((d, i) => {
                return <RouteLink key={i} to={`/sources/browse/${d.udn}`} className="list-group-item list-group-item-action">
                    <DeviceIcon icon={d.icons.find(i => i.w <= 48)} alt={d.name} service={d.type} />
                    {d.name}{d.description && ` (${d.description})`}
                </RouteLink>;
            })]}
        </ul>;
    }
}

function isMusicTrack(i) {
    return i.class.endsWith(".musicTrack");
}

class BrowserView extends React.Component {
    render() {
        const { navContext: { page, pageSize, urls } } = this.props;
        const { source: { total, result: { length: fetched }, parents } } = this.props.dataContext;

        return <div>
            <Breadcrumb dataContext={parents} baseUrl={urls.root} />
            <BrowserCoreSelectable dataContext={this.props.dataContext} filter={isMusicTrack}
                device={this.props.device} id={this.props.id}
                navigateHandler={this.props.navContext.navigateHandler}
                onSelectionChanged={this.props.onSelectionChanged} />
            <Pagination count={fetched} total={total} baseUrl={urls.current} current={page} size={pageSize} />
        </div>;
    }
}

const MediaSourcePicker = withProps(withDataFetch(MediaSourceList, { template: LoadIndicator }),
    { dataUrl: $api.discover("media_servers").url() });

const Browser = withBrowserCore(BrowserView);