import React from "react";
import { MemoryRouter, Switch, Route, Redirect } from "react-router-dom";
import Modal from "../../components/Modal";
import LoadIndicator from "../../components/LoadIndicator";
import DeviceIcon from "../common/DeviceIcon";
import { RouteLink } from "../../components/NavLink";
import { withDataFetch } from "../../components/DataFetch";
import { withBrowser } from "./BrowserUtils";
import BrowserCore from "./Browser";
import $api from "../../components/WebApi";
import SelectionService from "../../components/SelectionService";

export default class BrowserDialog extends React.Component {

    displayName = BrowserDialog.name;

    constructor(props) {
        super(props);
        this.state = { selection: { keys: [] } };
        this.selection = new SelectionService();
        this.selection.addEventListener("changed", e => {
            const { target: selection, detail: { device } = {} } = e;
            e.preventDefault();
            this.setState({ selection: selection, device: device });
        });
    }

    confirm = () => { return !!this.props.onConfirm && this.props.onConfirm(this.state.selection); }

    getSelectionData = () => { return [this.state.device, Array.from(this.state.selection.keys)]; }

    render() {
        const { id, title, confirmText = "OK", ...other } = this.props;
        return <Modal id={id} title={title} {...other} data-keyboard={true}>
            <Modal.Body className="p-0 d-flex flex-column">
                <MemoryRouter initialEntries={["/sources"]} initialIndex={0}>
                    <Switch>
                        <Route path={["/sources"]} exact render={() => <MediaSourceList />} />
                        <Route path={"/sources/:device/:id(.*)?"} render={props => props.match.params.id !== "-1"
                            ? <Browser selection={this.selection} {...props} />
                            : <Redirect to="/sources" />} />
                    </Switch>
                </MemoryRouter>
            </Modal.Body>
            <Modal.Footer>
                {(typeof (this.props.children) === "function" ? this.props.children(this) : this.props.children) ||
                    <React.Fragment>
                        <Modal.Button key="confirm" text={confirmText} className="btn-primary" disabled={this.selection.any()} onClick={this.confirm} dismiss />
                        <Modal.Button key="cancel" text="Cancel" className="btn-secondary" dismiss />
                    </React.Fragment>}
            </Modal.Footer>
        </Modal>;
    }
};

const serversFetch = $api.devices("servers").fetch;

const MediaSourceList = withDataFetch(({ dataContext: { source: data } }) =>
    <ul className="list-group list-group-flush">
        {data.map(({ udn, name, type, description, icons }, i) =>
            <RouteLink key={`dev-${i}`} to={`/sources/${udn}`} className="list-group-item list-group-item-action">
                <DeviceIcon icons={icons} service={type} />
                {name}{description && ` (${description})`}
            </RouteLink>)}
    </ul>, () => serversFetch, { template: LoadIndicator });

function isMusicTrack(item) {
    return item.class.endsWith(".musicTrack");
}

const BrowserView = (props) => <BrowserCore {...props} filter={isMusicTrack} captureKeyboardEvents useCheckboxes selectOnClick />

const Browser = withBrowser(BrowserView, false);
