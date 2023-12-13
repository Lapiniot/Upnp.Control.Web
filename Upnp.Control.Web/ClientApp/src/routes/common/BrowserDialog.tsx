import { HTMLAttributes, ReactNode, useCallback } from "react";
import { useDataFetch } from "../../hooks/DataFetch";
import Dialog, { DialogProps } from "../../components/Dialog";
import { MediaQueries, useMediaQuery } from "../../hooks/MediaQuery";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { useNavigatorClickHandler } from "../../hooks/Navigator";
import { usePortal } from "../../hooks/Portal";
import $api from "../../services/WebApi";
import DeviceIcon from "../common/DeviceIcon";
import BrowserCore from "./BrowserCore";
import { useContentBrowser } from "./BrowserUtils";
import { BrowserProps } from "./BrowserView";
import { RowStateMapperFunction, RowStateProvider, useRowStates } from "./RowStateContext";
import { Route, Routes, VirtualRouter } from "./VirtualRouter";

export type BrowserDialogProps<TContext = unknown> = HTMLAttributes<HTMLDivElement> & {
    browserProps?: BrowserProps<TContext>;
    rowStateMapper?: RowStateMapperFunction;
    confirmContent?: ((items: Upnp.DIDL.Item[]) => ReactNode) | string;
    onConfirmed(selection: BrowseResult): void;
    dismissOnOpen?: boolean;
} & DialogProps;

type ConfirmProps = {
    confirmContent?: ((items: Upnp.DIDL.Item[]) => ReactNode) | string;
    onConfirmed?: (selection: BrowseResult) => void;
}

export type BrowseResult = {
    device: string;
    keys: string[];
}

const fetchContentServersAsync = () => $api.devices("servers").json()

function MediaSourceList() {
    const { fetching, dataContext: { source = undefined } = {} } = useDataFetch(fetchContentServersAsync);
    const handler = useNavigatorClickHandler();
    const useSkeletons = $cfg["browser-dialog-sources"]?.useSkeletons ?? $cfg.useSkeletons;
    const loading = fetching && !source;
    const sources = loading && useSkeletons ? Array.from<undefined>({ length: $cfg["browser-dialog-sources"]?.placeholders?.count ?? $cfg.placeholders.count }) : source;
    const placeholderCls = loading ? ` placeholder-${$cfg["browser-dialog-sources"]?.placeholders?.effect ?? $cfg.placeholders.effect}` : "";
    return <>
        {fetching && !useSkeletons && <LoadIndicatorOverlay />}
        <ul className={`list-group list-group-flush overflow-auto${placeholderCls}`}>
            {sources?.map((d, i) => d ? <a key={i} href={`/upnp/${d.udn}/browse/0`} onClick={handler} className="list-group-item list-group-item-action hstack">
                <DeviceIcon device={d} />
                {d.name}{d.description && ` (${d.description})`}
            </a> : <a key={i} className="list-group-item disabled hstack">
                <DeviceIcon device={d} className="placeholder" />
                <span className={`placeholder w-${Math.ceil(2 * (1 + Math.random())) * 25}`}>&nbsp;</span>
            </a>)}
        </ul>
    </>
}

function ConfirmButton({ confirmContent = "Open", onConfirmed, device }: ConfirmProps & { device: string }) {
    const { [1]: render } = usePortal("#browser-dialog-footer");
    const { selection } = useRowStates();
    const callback = useCallback(() => onConfirmed?.({ device, keys: selection.map(i => i.id) }), [onConfirmed, selection, device]);

    return render(
        <Dialog.Button value="confirm" className="text-primary" disabled={selection.length === 0} onClick={callback}>
            {typeof confirmContent === "function" ? confirmContent(selection) : confirmContent}
        </Dialog.Button>)
}

function Browser({ confirmContent, onConfirmed, mapper, ...props }: BrowserProps<any> & { mapper?: RowStateMapperFunction } & ConfirmProps) {
    const { params, ...other } = useContentBrowser();
    const largeScreen = useMediaQuery(MediaQueries.largeScreen);
    const touchScreen = useMediaQuery(MediaQueries.touchDevice);
    return <RowStateProvider items={other.dataContext?.source.items} mapper={mapper}>
        <BrowserCore displayMode={largeScreen ? "table" : "list"} navigationMode={touchScreen ? "tap" : "dbl-click"} {...props} {...params} {...other} />
        <ConfirmButton device={params.device as string} confirmContent={confirmContent} onConfirmed={onConfirmed} />
    </RowStateProvider>
}

export default function BrowserDialog(props: BrowserDialogProps) {
    const { className, title, confirmContent, onConfirmed, browserProps = {}, rowStateMapper, ...other } = props;

    const renderFooter = useCallback(() => <Dialog.Footer id="browser-dialog-footer">
        <Dialog.Button autoFocus>Cancel</Dialog.Button>
    </Dialog.Footer>, []);

    return <Dialog className={`dialog-flush dialog-scrollable dialog-lg dialog-h-60 dialog-fullscreen-sm-down${className ? ` ${className}` : ""}`}
        caption={title} {...other} renderFooter={renderFooter}>
        <div className="vstack p-0 position-relative overflow-hidden border-bottom border-top">
            <VirtualRouter initialPath="/upnp">
                <Routes>
                    <Route path="upnp">
                        <Route index element={<MediaSourceList />} />
                        <Route path=":device/browse/*">
                            <Route path="*" element={<Browser {...browserProps} mapper={rowStateMapper}
                                confirmContent={confirmContent} onConfirmed={onConfirmed} />} />
                            <Route path="-1" element={<MediaSourceList />} />
                        </Route>
                    </Route>
                </Routes>
            </VirtualRouter>
        </div>
    </Dialog>
}