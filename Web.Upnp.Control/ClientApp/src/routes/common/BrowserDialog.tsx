import React, { HTMLAttributes, ReactNode } from "react";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import { DataFetchProps, withDataFetch } from "../../components/DataFetch";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import Modal, { ModalProps } from "../../components/Modal";
import { RouteLink } from "../../components/NavLink";
import $api from "../../components/WebApi";
import DeviceIcon from "../common/DeviceIcon";
import BrowserCore from "./BrowserCore";
import { withBrowserDataFetch } from "./BrowserUtils";
import { BrowserProps } from "./BrowserView";
import { BrowseRoutePath, UpnpDevice } from "./Types";

export type BrowserDialogProps<TContext = unknown> = HTMLAttributes<HTMLDivElement> & {
    browserProps?: BrowserProps<TContext>;
    confirmContent?: ((ids: string[]) => ReactNode) | string;
    onConfirmed?: (selection: BrowseResult) => void;
    dismissOnOpen?: boolean;
} & ModalProps

export type BrowseResult = {
    device: string;
    keys: string[];
};

const serversFetch = $api.devices("servers").jsonFetch;

const MediaSourceList = withDataFetch(({ dataContext: ctx, fetching }: DataFetchProps<UpnpDevice[]>) =>
    fetching
        ? <LoadIndicatorOverlay />
        : <ul className="list-group list-group-flush overflow-auto">
            {ctx?.source?.map(({ udn, name, type, description, icons }) =>
                <RouteLink key={udn} to={`/sources/${udn}`} className="nav-link list-group-item list-group-item-action hstack">
                    <DeviceIcon icons={icons} service={type} />
                    {name}{description && ` (${description})`}
                </RouteLink>)}
        </ul>
    , () => serversFetch, { usePreloader: true });

const Browser = withBrowserDataFetch(BrowserCore, false);

export default class BrowserDialog extends React.Component<BrowserDialogProps, { selection: string[], device: string | null }> {
    displayName = BrowserDialog.name;
    modalRef = React.createRef<Modal>();

    constructor(props: BrowserDialogProps) {
        super(props);
        this.state = { selection: [], device: null };
    }

    private selectionChanged = (ids: string[], device: string) => {
        this.setState({ selection: ids, device });
        return false;
    }

    private confirmHandler = () => !!this.props.onConfirmed && this.state.device &&
        this.props.onConfirmed({ device: this.state.device, keys: this.state.selection });

    private openHandler = () => {
        this.modalRef.current?.dismiss();
        return false;
    }

    render() {
        const { title, confirmContent = "Open", onConfirmed, browserProps = {}, ...other } = this.props;
        return <Modal title={title} {...other} data-bs-keyboard={true} ref={this.modalRef}>
            <Modal.Body className="vstack overflow-hidden p-0 position-relative border-bottom border-top" style={{ height: "60vh" }}>
                <MemoryRouter initialEntries={["/sources"]} initialIndex={0} >
                    <Switch>
                        <Route path={["/sources", "/sources/:device/-1"]} exact>
                            <MediaSourceList />
                        </Route>
                        <Route path={"/sources/:device/:id(.*)?" as BrowseRoutePath} render={props =>
                            <Browser {...props} open={this.props.dismissOnOpen ? this.openHandler : undefined} {...browserProps}
                                selectionChanged={this.selectionChanged} modalDialogMode extraState={props.match.params.device} />} />
                    </Switch>
                </MemoryRouter>
            </Modal.Body>
            <Modal.Footer>
                <React.Fragment>
                    <Modal.Button key="cancel" className="dismiss" dismiss>Cancel</Modal.Button>
                    <Modal.Button key="confirm" className="confirm" disabled={this.state.selection.length === 0} onClick={this.confirmHandler} dismiss>
                        {typeof confirmContent === "function" ? confirmContent(this.state.selection) : confirmContent}
                    </Modal.Button>
                </React.Fragment>
            </Modal.Footer>
        </Modal>;
    }
}
