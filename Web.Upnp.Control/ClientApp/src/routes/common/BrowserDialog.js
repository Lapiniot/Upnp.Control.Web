import React from "react";
import { MemoryRouter, Switch, Route } from "react-router-dom";
import Modal from "../../components/Modal";
import LoadIndicator from "../../components/LoadIndicator";
import Pagination from "./Pagination";
import DeviceIcon from "../common/DeviceIcon";
import { RouteLink } from "../../components/NavLink";
import { withProps, withDataFetch } from "../../components/Extensions";
import { renderWithDeviceProps, withBrowserCore } from "../common/BrowserCore";
import BrowserCoreSelectable from "../common/BrowserWithSelection";
import $api from "../../components/WebApi";

export default class BrowserDialog extends React.Component {
    displayName = BrowserDialog.name;

    selection = null;

    onSelectionChanged = (selection, device, id) => {
        this.selection = { device: device, id: id, selection: Array.from(selection.keys) };
    }

    render() {
        const { id, title, confirmText = "OK", onConfirm, ...other } = this.props;
        const onConfirmWrapper = () => { if (onConfirm) onConfirm(this.selection) };

        return <Modal id={id} title={title} onConfirm={onConfirmWrapper} {...other}>
            <Modal.Body className="p-0 modal-body-vh-60">
                <MemoryRouter initialEntries={["/sources"]} initialIndex={0}>
                    <Switch>
                        <Route path="/sources" exact component={MediaSourcePicker} />
                        <Route path="/sources/browse/:device/:id(.*)?" render={renderWithDeviceProps(Browser,
                            { baseUrl: "/sources/browse", onSelectionChanged: this.onSelectionChanged })} />
                    </Switch>
                </MemoryRouter>
            </Modal.Body>
            <Modal.Footer>
                <Modal.Button key="confirm" text={confirmText} className="btn-primary" onClick={onConfirm} dismiss />
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
                </RouteLink>
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
        const { source: { total, result: { length: fetched } } } = this.props.dataContext;
        return <div>
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