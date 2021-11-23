import React, { HTMLAttributes, ReactNode, useCallback } from "react";
import { DataFetchProps, withDataFetch } from "../../components/DataFetch";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import Modal, { ModalProps } from "../../components/Modal";
import { usePortal } from "../../components/Portal";
import $api from "../../components/WebApi";
import DeviceIcon from "../common/DeviceIcon";
import BrowserCore, { BrowserCoreProps } from "./BrowserCore";
import { withBrowserDataFetch } from "./BrowserUtils";
import { BrowserProps } from "./BrowserView";
import { useNavigator, useNavigatorClickHandler } from "./Navigator";
import { RowStateMapper, RowStateProvider, useRowStates } from "./RowStateContext";
import { DIDLItem, UpnpDevice } from "./Types";
import { Route, VirtualRouter } from "./VirtualRouter";

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

const MediaSourceList = withDataFetch(({ dataContext: ctx, fetching }: DataFetchProps<UpnpDevice[]>) => {
    const handler = useNavigatorClickHandler();
    return fetching
        ? <LoadIndicatorOverlay />
        : <ul className="list-group list-group-flush overflow-auto">
            {ctx?.source?.map(d => <a key={d.udn} href={`/sources/${d.udn}/0`} onClick={handler} className="nav-link list-group-item list-group-item-action hstack">
                <DeviceIcon device={d} />
                {d.name}{d.description && ` (${d.description})`}
            </a>)}
        </ul>;
}, () => serversFetch, { usePreloader: true });


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

const BrowserWithData = withBrowserDataFetch(BrowserWrapper, false);

function Browser(props: BrowserProps<any> & { mapper?: RowStateMapper } & ConfirmProps) {
    const { navigate, params } = useNavigator();
    return <BrowserWithData {...props} {...params} navigate={navigate} category="upnp" device={params.device as string} />
}

export default function BrowserDialog(props: BrowserDialogProps) {
    const { title, confirmContent, onConfirmed, browserProps = {}, rowStateMapper, ...other } = props;
    return <Modal title={title} {...other} data-bs-keyboard={true}>
        <Modal.Body className="vstack overflow-hidden p-0 position-relative border-bottom border-top" style={{ height: "60vh" }}>
            <VirtualRouter initialPath="/sources">
                <Route path="/sources" element={<MediaSourceList />} />
                <Route path="/sources/:device/-1" element={<MediaSourceList />} />
                <Route path="/sources/:device/:id/*" element={<Browser {...browserProps}
                    mapper={rowStateMapper} modalDialogMode
                    confirmContent={confirmContent} onConfirmed={onConfirmed} />} />
            </VirtualRouter>
        </Modal.Body>
        <Modal.Footer id="browser-dialog-footer">
            <React.Fragment>
                <Modal.Button key="cancel" className="dismiss" dismiss>Cancel</Modal.Button>
            </React.Fragment>
        </Modal.Footer>
    </Modal>
}