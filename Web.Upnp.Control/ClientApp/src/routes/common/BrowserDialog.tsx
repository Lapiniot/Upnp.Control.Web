import React, { HTMLAttributes, ReactNode } from "react";
import { MemoryRouter, Switch, Route, Redirect } from "react-router-dom";
import Modal, { ModalProps } from "../../components/Modal";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import DeviceIcon from "../common/DeviceIcon";
import { RouteLink } from "../../components/NavLink";
import { DataFetchProps, withDataFetch } from "../../components/DataFetch";
import { withBrowserDataFetch } from "./BrowserUtils";
import BrowserCore from "./BrowserCore";
import $api from "../../components/WebApi";
import { BrowseRoutePath, UpnpDevice } from "./Types";
import { BrowserProps } from "./BrowserView";

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

export default class BrowserDialog extends React.Component<BrowserDialogProps, { selection: string[] }> {
    displayName = BrowserDialog.name;
    browserRef = React.createRef<any>();
    modalRef = React.createRef<Modal>();

    constructor(props: BrowserDialogProps) {
        super(props);
        this.state = { selection: [] };
    }

    private selectionChanged = (ids: string[]) => {
        this.setState({ selection: ids });
        return false;
    }

    private confirmHandler = () => !!this.props.onConfirmed &&
        this.props.onConfirmed({ device: this.browserRef?.current?.props.match.params.device, keys: this.state.selection });

    private openHandler = () => {
        this.modalRef.current?.dismiss();
        return false;
    }

    render() {
        const { title, confirmContent = "Open", onConfirmed, browserProps = {}, ...other } = this.props;
        return <Modal title={title} {...other} data-bs-keyboard={true} ref={this.modalRef}>
            <Modal.Body className="vstack overflow-hidden p-0 position-relative border-bottom border-top" style={{ height: "60vh" }}>
                <MemoryRouter initialEntries={["/sources"]} initialIndex={0}>
                    <Switch>
                        <Route path="/sources" exact>
                            <MediaSourceList />
                        </Route>
                        <Route path="/sources/:device/-1" exact>
                            <Redirect to="/sources" />
                        </Route>
                        <Route path={"/sources/:device/:id(.*)?" as BrowseRoutePath} render={props =>
                            <Browser {...props} ref={this.browserRef}
                                open={this.props.dismissOnOpen ? this.openHandler : undefined} {...browserProps}
                                selectionChanged={this.selectionChanged} modalDialogMode />} />
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
