import React, { HTMLAttributes } from "react";
import { MemoryRouter, Switch, Route, Redirect } from "react-router-dom";
import Modal from "../../components/Modal";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import DeviceIcon from "../common/DeviceIcon";
import { RouteLink } from "../../components/NavLink";
import { DataFetchProps, withDataFetch } from "../../components/DataFetch";
import { withBrowser } from "./BrowserUtils";
import BrowserCore from "./Browser";
import $api from "../../components/WebApi";
import SelectionService from "../../components/SelectionService";
import { DIDLItem, UpnpDevice } from "./Types";

export type BrowserDialogProps = HTMLAttributes<HTMLDivElement> & {
    confirmText?: string;
    onConfirm: (selection: string[]) => void;
};

export default class BrowserDialog extends React.Component<BrowserDialogProps, { selection: any }> {

    displayName = BrowserDialog.name;
    browserRef = React.createRef<any>();
    selection;

    constructor(props: BrowserDialogProps) {
        super(props);
        this.state = { selection: { keys: [] } };
        this.selection = new SelectionService();
        this.selection.addEventListener("changed", e => this.setState({ selection: e.target }));
    }

    confirm = () => { return !!this.props.onConfirm && this.props.onConfirm(Array.from(this.selection.keys)); }

    getSelectionData = () => {
        return [this.browserRef?.current?.props.match.params.device, Array.from(this.state.selection.keys)];
    }

    render() {
        const { id, title, confirmText = "OK", ...other } = this.props;
        return <Modal id={id} title={title} {...other} data-keyboard={true}>
            <Modal.Body className="p-0 d-flex flex-column">
                <MemoryRouter initialEntries={["/sources"]} initialIndex={0}>
                    <Switch>
                        <Route path={["/sources"]} exact render={() => <MediaSourceList />} />
                        <Route path={"/sources/:device/-1"} exact render={() => <Redirect to="/sources" />} />
                        <Route path={"/sources/:device/:id(.*)?"} render={props =>
                            <Browser {...props} selection={this.selection} ref={this.browserRef} filter={isMusicTrack}
                                captureKeyboardEvents useCheckboxes selectOnClick />} />
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

const MediaSourceList = withDataFetch(({ dataContext: ctx, fetching }: DataFetchProps<UpnpDevice[]>) =>
    <div>
        {fetching
            ? <LoadIndicatorOverlay />
            : <ul className="list-group list-group-flush">
                {ctx?.source?.map(({ udn, name, type, description, icons }, i) =>
                    <RouteLink key={`dev-${i}`} to={`/sources/${udn}`} className="list-group-item list-group-item-action">
                        <DeviceIcon icons={icons} service={type} />
                        {name}{description && ` (${description})`}
                    </RouteLink>)}
            </ul>}
    </div>, () => serversFetch, { usePreloader: true });

function isMusicTrack(item: DIDLItem) {
    return item.class.endsWith(".musicTrack");
}

const Browser = withBrowser(BrowserCore, false);
