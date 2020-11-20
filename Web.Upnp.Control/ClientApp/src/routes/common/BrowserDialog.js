import React from "react";
import { MemoryRouter, Switch, Route, Redirect } from "react-router-dom";
import Modal from "../../components/Modal";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
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
        this.browserRef = React.createRef();
        this.selection = new SelectionService();
        this.selection.addEventListener("changed", e => {
            const { target: selection } = e;
            e.preventDefault();
            this.setState({ selection: selection });
        });
    }

    confirm = () => { return !!this.props.onConfirm && this.props.onConfirm(this.state.selection); }

    getSelectionData = () => {
        return [this.browserRef.current.props.match.params.device, Array.from(this.state.selection.keys)];
    }

    render() {
        const { id, title, confirmText = "OK", ...other } = this.props;
        return <Modal id={id} title={title} {...other} data-keyboard={true}>
            <Modal.Body className="p-0 d-flex flex-column">
                <MemoryRouter initialEntries={["/sources"]} initialIndex={0}>
                    <Switch>
                        <Route path={["/sources"]} exact render={() => <MediaSourceList />} />
                        <Route path={"/sources/:device/:id(.*)?"} render={props => props.match.params.id !== "-1"
                            ? <Browser selection={this.selection} {...props} ref={this.browserRef} />
                            : <Redirect to="/sources" />} />
                    </Switch>
                </MemoryRouter>
            </Modal.Body>
            <Modal.Footer>
                {(typeof (this.props.children) === "function" ? this.props.children(this) : this.props.children) ||
                    <React.Fragment>
                        <Modal.Button key="confirm" className="btn-primary" disabled={this.selection.any()} onClick={this.confirm} dismiss>{confirmText}</Modal.Button>
                        <Modal.Button key="cancel" className="btn-secondary" dismiss>Cancel</Modal.Button>
                    </React.Fragment>}
            </Modal.Footer>
        </Modal>;
    }
};

const serversFetch = $api.devices("servers").jsonFetch;

const MediaSourceList = withDataFetch(({ dataContext: { source: data }, fetching }) =>
    <div>
        {fetching
            ? <LoadIndicatorOverlay />
            : <ul className="list-group list-group-flush">
                {data.map(({ udn, name, type, description, icons }, i) =>
                    <RouteLink key={`dev-${i}`} to={`/sources/${udn}`} className="list-group-item list-group-item-action">
                        <DeviceIcon icons={icons} service={type} />
                        {name}{description && ` (${description})`}
                    </RouteLink>)}
            </ul>}
    </div>, () => serversFetch, { usePreloader: true });

function isMusicTrack(item) {
    return item.class.endsWith(".musicTrack");
}

const BrowserView = (props) => <BrowserCore {...props} filter={isMusicTrack} captureKeyboardEvents useCheckboxes selectOnClick />;

const Browser = withBrowser(BrowserView, false);
