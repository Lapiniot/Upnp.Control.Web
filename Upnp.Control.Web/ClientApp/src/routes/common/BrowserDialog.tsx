import { ComponentPropsWithRef, HTMLAttributes, ReactNode, useCallback, useMemo } from "react";
import Dialog from "../../components/Dialog";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { RowStateMapperFunction, RowStateProvider, useRowStates } from "../../components/RowStateContext";
import { Route, Routes, VirtualRouter } from "../../components/VirtualRouter";
import { useDataFetch } from "../../hooks/DataFetch";
import { MediaQueries, useMediaQuery } from "../../hooks/MediaQuery";
import { useNavigatorClickHandler } from "../../hooks/Navigator";
import { usePortal } from "../../hooks/Portal";
import $api from "../../services/WebApi";
import DeviceIcon from "../common/DeviceIcon";
import BrowserCore from "./BrowserCore";
import { useContentBrowser } from "./BrowserUtils";
import { BrowserProps } from "./BrowserView";

export type BrowserDialogProps<TContext = unknown> = HTMLAttributes<HTMLDivElement> & {
    browserProps?: BrowserProps<TContext>;
    rowStateMapper?: RowStateMapperFunction;
    confirmContent?: ((items: Upnp.DIDL.Item[]) => ReactNode) | string;
    onConfirmed(selection: BrowseResult): void;
    dismissOnOpen?: boolean;
} & ComponentPropsWithRef<typeof Dialog>

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
        <div className={`list-group list-group-bare overflow-auto${placeholderCls}`}>
            {sources?.map((d, i) => d ? <a key={i} href={`/upnp/${d.udn}/browse/0`} onClick={handler} className="list-group-item list-group-item-action hstack px-0">
                <DeviceIcon device={d} />
                {d.name}{d.description && ` (${d.description})`}
            </a> : <a key={i} className="list-group-item disabled hstack px-0">
                <DeviceIcon device={d} className="placeholder" />
                <span className={`placeholder w-${Math.ceil(2 * (1 + Math.random())) * 25}`}>&nbsp;</span>
            </a>)}
        </div>
    </>
}

function ConfirmButton({ confirmContent = "Open", onConfirmed, device }: ConfirmProps & { device: string }) {
    const { [1]: render } = usePortal("#browser-dialog-footer");
    const { selection } = useRowStates();
    const callback = useCallback(() => onConfirmed?.({ device, keys: selection.map(i => i.id) }), [onConfirmed, selection, device]);

    return render(<Dialog.Button value="confirm" disabled={selection.length === 0} onClick={callback}>
        {typeof confirmContent === "function" ? confirmContent(selection) : confirmContent}
    </Dialog.Button>)
}

function Browser({ confirmContent, onConfirmed, mapper, ...props }: Partial<ComponentPropsWithRef<typeof BrowserCore>> & { mapper?: RowStateMapperFunction } & ConfirmProps) {
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

    const actions = useMemo(() => <div id="browser-dialog-footer">
        <Dialog.Button autoFocus>Cancel</Dialog.Button>
    </div>, []);

    const dialog = useMemo(() => <Browser {...browserProps} mapper={rowStateMapper} confirmContent={confirmContent} onConfirmed={onConfirmed} />,
        [browserProps, confirmContent, rowStateMapper, onConfirmed]);

    return <Dialog className={`h-100 dialog-scrollable dialog-lg dialog-fullscreen-sm-down${className ? ` ${className}` : ""}`}
        caption={title} {...other} actions={actions}>
        <div className="vstack p-0 position-relative overflow-hidden">
            <VirtualRouter initialPath="/upnp">
                <Routes>
                    <Route path="upnp">
                        <Route index element={<MediaSourceList />} />
                        <Route path=":device/browse/*">
                            <Route path=":id" element={dialog} />
                            <Route path="*" element={dialog} />
                            <Route path="-1" element={<MediaSourceList />} />
                        </Route>
                    </Route>
                </Routes>
            </VirtualRouter>
        </div>
    </Dialog>
}