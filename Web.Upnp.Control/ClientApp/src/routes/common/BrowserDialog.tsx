import React, { HTMLAttributes, ReactNode, useCallback } from "react";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import { DataFetchProps, withDataFetch } from "../../components/DataFetch";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import Modal, { ModalProps } from "../../components/Modal";
import { RouteLink } from "../../components/NavLink";
import { usePortal } from "../../components/Portal";
import $api from "../../components/WebApi";
import DeviceIcon from "../common/DeviceIcon";
import BrowserCore, { BrowserCoreProps } from "./BrowserCore";
import { withBrowserDataFetch } from "./BrowserUtils";
import { BrowserProps } from "./BrowserView";
import { RowStateMapper, RowStateProvider, useRowStates } from "./RowStateContext";
import { BrowseRoutePath, DIDLItem, UpnpDevice } from "./Types";

export type BrowserDialogProps<TContext = unknown> = HTMLAttributes<HTMLDivElement> & {
    browserProps?: BrowserProps<TContext>;
    rowStateMapper?: RowStateMapper;
    confirmContent?: ((items: DIDLItem[]) => ReactNode) | string;
    onConfirmed?: (selection: BrowseResult) => void;
    dismissOnOpen?: boolean;
} & ModalProps

type ConfirmProps = {
    confirmContent?: ((items: DIDLItem[]) => ReactNode) | string;
    onConfirmed?: (selection: BrowseResult) => void;
};

type BrowserWrapperProps<TContext> = BrowserCoreProps<TContext> & { mapper?: RowStateMapper, device: string } & ConfirmProps;

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


function BrowserWrapper<TContext>({ confirmContent, onConfirmed, mapper, dataContext, device, ...other }: BrowserWrapperProps<TContext>) {
    return <RowStateProvider items={dataContext?.source.items} mapper={mapper}>
        <BrowserCore {...other} dataContext={dataContext} />
        <ConfirmButton device={device} confirmContent={confirmContent} onConfirmed={onConfirmed} />
    </RowStateProvider>
}

function ConfirmButton({ confirmContent = "Open", onConfirmed, device }: ConfirmProps & { device: string }) {
    const { [1]: render } = usePortal("#browser-dialog-footer");
    const { selection } = useRowStates();
    const callback = useCallback(() => onConfirmed?.({ device, keys: selection.map(i => i.id) }), [onConfirmed, selection, device]);

    return render(
        <Modal.Button key="confirm" className="confirm" dismiss disabled={selection.length === 0} onClick={callback}>
            {typeof confirmContent === "function" ? confirmContent(selection) : confirmContent}
        </Modal.Button>)
}

const Browser = withBrowserDataFetch(BrowserWrapper, false);

export default class BrowserDialog extends React.Component<BrowserDialogProps> {
    displayName = BrowserDialog.name;

    render() {
        const { title, confirmContent, onConfirmed, browserProps = {}, rowStateMapper, ...other } = this.props;
        return <Modal title={title} {...other} data-bs-keyboard={true}>
            <Modal.Body className="vstack overflow-hidden p-0 position-relative border-bottom border-top" style={{ height: "60vh" }}>
                <MemoryRouter initialEntries={["/sources"]} initialIndex={0} >
                    <Switch>
                        <Route path={["/sources", "/sources/:device/-1"]} exact>
                            <MediaSourceList />
                        </Route>
                        <Route path={"/sources/:device/:id(.*)?" as BrowseRoutePath}>
                            <Browser {...browserProps} mapper={rowStateMapper} modalDialogMode
                                confirmContent={confirmContent} onConfirmed={onConfirmed} />
                        </Route>
                    </Switch>
                </MemoryRouter>
            </Modal.Body>
            <Modal.Footer id="browser-dialog-footer">
                <React.Fragment>
                    <Modal.Button key="cancel" className="dismiss" dismiss>Cancel</Modal.Button>
                </React.Fragment>
            </Modal.Footer>
        </Modal>;
    }
}