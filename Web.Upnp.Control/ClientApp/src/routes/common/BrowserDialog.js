import React from "react";
import { MemoryRouter, Switch, Route } from "react-router-dom";
import Modal from "../../components/Modal";
import { ConfirmationDialog } from "../../components/Dialogs";
import LoadIndicator from "../../components/LoadIndicator";
import DeviceIcon from "../common/DeviceIcon";
import { RouteLink } from "../../components/NavLink";
import { withProps, withDataFetch } from "../../components/Extensions";
import { renderWithDeviceProps, withBrowserCore } from "../common/BrowserCore";
import BrowserCoreSelectable from "../common/BrowserWithSelection";
import $api from "../../components/WebApi";

export default class BrowserDialog extends React.Component {
    displayName = BrowserDialog.name;

    render() {
        const { onSelectionChanged, ...other } = this.props;
        return <ConfirmationDialog {...other}>
            <Modal.Body className="p-0">
                <MemoryRouter initialEntries={["/sources"]} initialIndex={0}>
                    <Switch>
                        <Route path="/sources" exact component={MediaSourcePicker} />
                        <Route path="/sources/browse/:device/:id(.*)?" render={renderWithDeviceProps(Browser,
                            { baseUrl: "/sources/browse", onSelectionChanged: onSelectionChanged })} />
                    </Switch>
                </MemoryRouter>
            </Modal.Body>
        </ConfirmationDialog>;
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

class BrowserView extends React.Component {
    render() {
        return <div>
            <BrowserCoreSelectable dataContext={this.props.dataContext}
                navigateHandler={this.props.navContext.navigateHandler}
                onSelectionChanged={this.props.onSelectionChanged} />
        </div>;
    }
}

const MediaSourcePicker = withProps(withDataFetch(MediaSourceList, { template: LoadIndicator }),
    { dataUrl: $api.discover("media_servers").url() });

const Browser = withBrowserCore(BrowserView);