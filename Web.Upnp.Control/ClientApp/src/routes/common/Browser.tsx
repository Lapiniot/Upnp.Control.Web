import React from "react";
import { itemBookmarks } from "../../components/BookmarkService";
import { DataContext } from "../../components/DataFetch";
import { DropdownMenu, MenuItem } from "../../components/DropdownMenu";
import WebApi from "../../components/WebApi";
import { useBookmarkButton } from "./BookmarkButton";
import BrowserCore, { BrowserCoreProps } from "./BrowserCore";
import { BottomBar } from "./BottomBar";
import { DIDLUtils } from "./BrowserUtils";
import BrowserView, { CellTemplate, CellTemplateProps, RowState } from "./BrowserView";
import { TablePagination } from "./Pagination";
import $s from "./Settings";
import { BrowserSvgSymbols } from "./SvgSymbols";
import { BrowseFetchResult, DIDLItem, Services, UpnpDevice } from "./Types";
import ModalHost from "../../components/ModalHost";
import ItemInfoDialog from "./ItemInfoDialog";

async function umiEnqueue(target: string, source: string, items: string[]) {
    const queues = WebApi.queues(target);
    const timeout = $s.get("timeout");
    await queues.clear("Q:0").fetch(timeout);
    await queues.enqueue("Q:0", source, items).fetch($s.get("containerScanTimeout"));
    await WebApi.control(target).playUri("x-mi://sys/queue?id=0").fetch(timeout);
}

function umiCreatePlaylist(target: string, title: string, source: string, items: string[]) {
    return WebApi.playlist(target).createFromItems(title, source, items, $s.get("containerScanDepth")).fetch($s.get("containerScanTimeout"));
}

function playItem(target: string, source: string, id: string) {
    return WebApi.control(target).play(id, source).fetch($s.get("timeout"));
}

function isUmiDevice(device: UpnpDevice) {
    return device.services.some(s => s.type.startsWith(Services.UmiPlaylist));
}

type CellContext = {
    disabled?: boolean;
    device: string;
    deviceName?: string;
}

const BookmarkItemButton = useBookmarkButton("ItemBookmarkWidget", itemBookmarks);

function Template(props: CellTemplateProps<CellContext>) {
    return <CellTemplate {...props}>
        {props.data.container && props.context?.deviceName &&
            <BookmarkItemButton item={props.data} device={props.context?.device as string} deviceName={props.context?.deviceName as string} />}
        <button type="button" className="btn btn-round btn-plain" data-id={props.data.id}
            data-bs-toggle="dropdown" disabled={props.context?.disabled}>
            <svg><use href="#ellipsis-v" /></svg>
        </button>
    </CellTemplate>;
}

type BrowserState = {
    ctx?: DataContext<BrowseFetchResult>;
    device: UpnpDevice | null;
    umis: UpnpDevice[];
    renderers: UpnpDevice[];
    selection: { items: DIDLItem[], umiCompatible: boolean, rendererCompatible: boolean };
    fetching: boolean;
    error: Error | null;
};

type BrowserProps = BrowserCoreProps<CellContext> & {
    device: string;
};

export class Browser extends React.Component<BrowserProps, BrowserState> {

    state: BrowserState = { device: null, umis: [], renderers: [], selection: { items: [], umiCompatible: false, rendererCompatible: false }, fetching: false, error: null }

    modalHostRef = React.createRef<ModalHost>();

    async componentDidMount() {
        try {
            const timeout = $s.get("timeout");
            const devices: UpnpDevice[] = await WebApi.devices("renderers").jsonFetch(timeout);
            const device: UpnpDevice = await WebApi.devices("upnp", this.props.device).jsonFetch(timeout);
            this.setState({ device, umis: devices.filter(isUmiDevice), renderers: devices.filter(d => !isUmiDevice(d)) })
        }
        catch (error) {
            console.error(error);
        }
    }

    static getDerivedStateFromProps({ dataContext: propsCtx }: BrowserProps, { ctx: stateCtx }: BrowserState) {
        if (propsCtx && propsCtx !== stateCtx)
            return { ctx: propsCtx, selection: { items: [], umiCompatible: false, rendererCompatible: false } }
        else
            return null;
    }

    rowState = () => RowState.Selectable | RowState.Navigable;

    selectionChanged = (ids: string[]) => {
        const items = this.props.dataContext?.source.items.filter(i => ids.includes(i.id)) ?? [];
        this.setState({
            selection: {
                items,
                umiCompatible: items.some(i => DIDLUtils.isContainer(i) || DIDLUtils.isMusicTrack(i)),
                rendererCompatible: items.some(DIDLUtils.isMediaItem)
            }
        });
        return false;
    }

    itemMenuSelectedHandler = async ({ dataset: { action, udn } }: HTMLElement, anchor?: HTMLElement) => {
        const { dataContext, device } = this.props;

        if (!action || !anchor || !device || !dataContext?.source) return;
        const item = dataContext.source.items.find(i => i.id === anchor.dataset.id);
        if (!item) return;

        if (udn) {
            if (action.startsWith("send.")) {
                await this.createPlaylist(udn, item.title, device, [item.id]);
            } else if (action.startsWith("play.") && udn) {
                await this.playItems(udn, device, [item.id]);
            }
        } else if (action == "info") {
            this.modalHostRef.current?.show(<ItemInfoDialog item={item} />);
        }
    }

    actionMenuSelectedHandler = async ({ dataset: { action, udn } }: HTMLElement) => {
        const { dataContext, device } = this.props;

        if (!action || !device || !udn || !dataContext?.source || !this.state.selection) return;

        if (action.startsWith("send.")) {
            const items = this.getUmiCompatibleSelectedItems();
            const title = items?.map(i => i?.title).join(";");
            await this.createPlaylist(udn, title, device, items.map(i => i.id));
        }
        else if (action.startsWith("play.")) {
            await this.playItems(udn, device, this.getUmiCompatibleSelectedItems().map(i => i.id));
        }
    }

    renderItemMenuHandler = (anchor?: HTMLElement | null) => {
        const id = anchor?.dataset.id;
        if (!id) return;

        const { umis, renderers } = this.state;
        const { dataContext: ctx } = this.props;

        const item = ctx?.source.items.find(i => i.id === id);
        if (!item) return;

        const umiAcceptable = !!umis.length && (DIDLUtils.isContainer(item) || DIDLUtils.isMusicTrack(item));
        const rendererAcceptable = !!renderers.length && DIDLUtils.isMediaItem(item);

        return <>
            {this.renderMenu(umiAcceptable, rendererAcceptable, umis, renderers)}
            {(umiAcceptable || rendererAcceptable) &&
                <li><hr className="dropdown-divider mx-2" /></li>}
            <MenuItem action={"info"} glyph="info">Get Info</MenuItem>
        </>;
    }

    renderActionMenuHandler = () => {
        const { selection: { umiCompatible, rendererCompatible }, umis, renderers } = this.state;
        return this.renderMenu(umiCompatible, rendererCompatible, umis, renderers);
    }

    private async playItems(target: string, source: string, items: string[]) {
        try {
            if (this.state.umis.some(d => d.udn === target)) {
                await umiEnqueue(target, source, items);
            }
            else {
                await playItem(target, source, items[0]);
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    private async createPlaylist(target: string, title: string, source: string, items: string[]) {
        this.setState({ fetching: true, error: null });
        try {
            await umiCreatePlaylist(target, title, source, items);
            this.setState({ fetching: false });
        }
        catch (error) {
            console.error(error);
            this.setState({ fetching: false, error: error });
        }
    }

    private renderMenu(umiAcceptable: boolean, rendererAcceptable: boolean, umis: UpnpDevice[], renderers: UpnpDevice[]) {
        return <>
            {umiAcceptable && <>
                <li><h6 className="dropdown-header">Send as Playlist to</h6></li>
                {umis.map(({ udn, name }) => this.renderMenuItem(udn, "send", name))}
            </>}
            {(umiAcceptable || rendererAcceptable) && <>
                <li><h6 className="dropdown-header">Play on</h6></li>
                {umiAcceptable && umis.map(({ udn, name }) => this.renderMenuItem(udn, "play", name))}
                {rendererAcceptable && renderers.map(({ udn, name }) => this.renderMenuItem(udn, "play", name))}
            </>}
        </>;
    }

    private renderMenuItem(udn: string, action: string, name: string): JSX.Element {
        return <MenuItem key={`${action}.${udn}`} action={`${action}.${udn}`} data-udn={udn}>&laquo;{name}&raquo;</MenuItem>;
    }

    private getUmiCompatibleSelectedItems() {
        return this.state.selection.items.filter(i => DIDLUtils.isContainer(i) || DIDLUtils.isMusicTrack(i));
    }

    render() {
        const { dataContext: data, location, history, p: page, s: size } = this.props;
        const { selection: { umiCompatible, rendererCompatible }, umis, renderers } = this.state;
        const isActionButtonEnabled = (umis.length && umiCompatible) || (renderers.length && rendererCompatible);
        const isItemActionMenuEnabled = umis.length || renderers.length;
        const ctx = {
            disabled: !isItemActionMenuEnabled,
            device: this.props.device,
            deviceName: this.state.device?.name
        };

        return <div className="h-100 overflow-auto safari-scroll-fix d-flex flex-column">
            <BrowserSvgSymbols />
            <BrowserCore mainCellTemplate={Template} mainCellContext={ctx} withPagination={false}
                useCheckboxes multiSelect rowState={this.rowState} selectionChanged={this.selectionChanged}
                {...this.props} fetching={this.state.fetching || this.props.fetching}>
                <BrowserView.ContextMenu render={this.renderItemMenuHandler} onSelected={this.itemMenuSelectedHandler} />
            </BrowserCore>
            <BottomBar>
                <TablePagination location={location} history={history}
                    total={data?.source.total ?? 0} current={typeof page === "string" ? parseInt(page) : 1}
                    pageSize={typeof size === "string" ? parseInt(size) : $s.get("pageSize")} />
                <button type="button" className="btn btn-round btn-plain" data-bs-toggle="dropdown" disabled={!isActionButtonEnabled}>
                    <svg className="icon"><use href="#ellipsis-v" /></svg>
                </button>
                <DropdownMenu render={this.renderActionMenuHandler} onSelected={this.actionMenuSelectedHandler} />
            </BottomBar>
            <ModalHost ref={this.modalHostRef} />
        </div>;
    }
}
