import React, { HTMLAttributes } from "react";
import { MemoryRouter, Switch, Route, Redirect } from "react-router-dom";
import Modal, { ModalProps } from "../../components/Modal";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import DeviceIcon from "../common/DeviceIcon";
import { RouteLink } from "../../components/NavLink";
import { DataFetchProps, withDataFetch } from "../../components/DataFetch";
import { withBrowser } from "./BrowserUtils";
import BrowserCore from "./Browser";
import $api from "../../components/WebApi";
import { UpnpDevice } from "./Types";
import { BrowserCoreProps } from "./BrowserCore";
import SelectionService from "../../components/SelectionService";

export type BrowserDialogProps = HTMLAttributes<HTMLDivElement> & {
    browserProps?: BrowserCoreProps;
    confirmText?: string;
    onConfirm?: (selection: BrowseResult) => void;
    dismissOnOpen?: boolean;
} & ModalProps

export type BrowseResult = {
    device: string;
    keys: string[];
};

const serversFetch = $api.devices("servers").jsonFetch;

const MediaSourceList = withDataFetch(({ dataContext: ctx, fetching }: DataFetchProps<UpnpDevice[]>) =>
    <div>
        {fetching
            ? <LoadIndicatorOverlay />
            : <ul className="list-group list-group-flush">
                {ctx?.source?.map(({ udn, name, type, description, icons }) =>
                    <RouteLink key={udn} to={`/sources/${udn}`} className="nav-link list-group-item list-group-item-action d-flex align-items-center">
                        <DeviceIcon icons={icons} service={type} />
                        {name}{description && ` (${description})`}
                    </RouteLink>)}
            </ul>}
    </div>, () => serversFetch, { usePreloader: true });

const Browser = withBrowser(BrowserCore, false);

export default class BrowserDialog extends React.Component<BrowserDialogProps, { selection: string[] }> {

    displayName = BrowserDialog.name;
    browserRef = React.createRef<any>();
    modalRef = React.createRef<Modal>();
    selection: SelectionService;

    constructor(props: BrowserDialogProps) {
        super(props);
        this.state = { selection: [] };
        this.selection = new SelectionService();
    }

    private selectionChanged = (ids: string[]) => {
        this.setState({ selection: ids });
        return false;
    }

    private confirm = () => { return !!this.props.onConfirm && this.props.onConfirm(this.getSelectionData()); }

    private open = () => {
        this.modalRef.current?.dismiss();
        return false;
    }

    public getSelectionData = (): BrowseResult => {
        return { device: this.browserRef?.current?.props.match.params.device, keys: this.state.selection };
    }

    public clearSelection = () => this.selection.clear();

    render() {
        const { id, title, confirmText = "OK", onConfirm, browserProps = {}, ...other } = this.props;
        return <Modal id={id} title={title} {...other} data-bs-keyboard={true} ref={this.modalRef}>
            <Modal.Body className="overflow-hidden p-0 position-relative d-flex flex-column">
                <div className="overflow-auto flex-grow-1 d-flex flex-column">
                    <MemoryRouter initialEntries={["/sources"]} initialIndex={0}>
                        <Switch>
                            <Route path={["/sources"]} exact render={() => <MediaSourceList />} />
                            <Route path={"/sources/:device/-1"} exact render={() => <Redirect to="/sources" />} />
                            <Route path={"/sources/:device/:id(.*)?"} render={props =>
                                <Browser {...props} ref={this.browserRef} className="flex-expand"
                                    open={this.props.dismissOnOpen ? this.open : undefined} {...browserProps}
                                    selection={this.selection} selectionChanged={this.selectionChanged} modalDialogMode />} />
                        </Switch>
                    </MemoryRouter>
                </div>
            </Modal.Body>
            <Modal.Footer>
                {(typeof (this.props.children) === "function" ? this.props.children(this) : this.props.children) ||
                    <React.Fragment>
                        <Modal.Button key="cancel" className="btn-secondary" dismiss>Cancel</Modal.Button>
                        <Modal.Button key="confirm" className="btn-primary" disabled={this.state.selection.length === 0} onClick={this.confirm} dismiss>{confirmText}</Modal.Button>
                    </React.Fragment>}
            </Modal.Footer>
        </Modal>;
    }
}
