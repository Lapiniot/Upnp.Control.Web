import React from "react";
import { itemBookmarks } from "../../components/BookmarkService";
import { DropdownMenu, MenuItem } from "../../components/DropdownMenu";
import { MediaQueries } from "../../components/MediaQueries";
import ModalHost from "../../components/ModalHost";
import WebApi from "../../components/WebApi";
import { useBookmarkButton } from "./BookmarkButton";
import { BottomBar } from "./BottomBar";
import Breadcrumb from "./Breadcrumb";
import { BrowserActionMenu, renderActionMenuItem } from "./BrowserActionMenu";
import BrowserCore, { BrowserCoreProps } from "./BrowserCore";
import { DIDLTools } from "./DIDLTools";
import { CellTemplate, CellTemplateProps } from "./BrowserView";
import ItemInfoModal from "./ItemInfoModal";
import { TablePagination } from "./Pagination";
import { RowStateProvider } from "./RowStateContext";
import $s from "./Settings";
import { BrowserSvgSymbols } from "./SvgSymbols";
import { DIDLItem, UpnpDevice } from "./Types";
import { UpnpDeviceTools as UDT } from "./UpnpDeviceTools";

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
    umis: UpnpDevice[],
    renderers: UpnpDevice[],
    fetching?: boolean,
    error?: any
}

type BrowserProps = BrowserCoreProps<CellContext> & { device: string; };

export class Browser extends React.Component<BrowserProps, BrowserState> {
    modalHostRef = React.createRef<ModalHost>();

    constructor(props: BrowserProps) {
        super(props);
        this.state = { umis: [], renderers: [] };
    }

    async componentDidMount() {
        try {
            const timeout = $s.get("timeout");
            const devices: UpnpDevice[] = await WebApi.devices("renderers").jsonFetch(timeout);
            this.setState({ umis: devices.filter(UDT.isUmiDevice), renderers: devices.filter(d => !UDT.isUmiDevice(d)) })
        }
        catch (error) {
            console.error(error);
        }
    }

    getCellContext = (): CellContext => ({
        disabled: !(this.state.umis.length || this.state.renderers.length),
        device: this.props.device,
        deviceName: this.props.dataContext?.source.dev?.name
    });

    openHandler = (index: number) => {
        const item = this.props.dataContext?.source.items?.[index];
        if (item) this.props.navigate(`../${item.id}`);
        return true;
    }

    itemMenuSelectedHandler = async ({ dataset: { action, udn } }: HTMLElement, anchor?: HTMLElement) => {
        const { dataContext, device } = this.props;

        if (!action || !anchor || !device || !dataContext?.source?.items) return;
        const item = dataContext.source.items.find(i => i.id === anchor.dataset.id);
        if (!item) return;

        if (udn) {
            if (action.startsWith("send.")) {
                await this.createPlaylist(udn, item.title, device, [item.id]);
            } else if (action.startsWith("play.") && udn) {
                await this.playItems(udn, device, [item.id]);
            }
        } else if (action == "info") {
            this.modalHostRef.current?.show(<ItemInfoModal item={item} />);
        }
    }

    actionMenuSelectedHandler = async (action: string, udn: string, selection: DIDLItem[]) => {
        const items = selection.filter(i => DIDLTools.isContainer(i) || DIDLTools.isMusicTrack(i))

        if (action.startsWith("send.")) {
            const title = items?.map(i => i?.title).join(";");
            await this.createPlaylist(udn, title, this.props.device, items.map(i => i.id));
        }
        else if (action.startsWith("play.")) {
            await this.playItems(udn, this.props.device, items.map(i => i.id));
        }
    }

    renderActionMenu = () => {
        return <BrowserActionMenu umis={this.state.umis} renderers={this.state.renderers} onSelected={this.actionMenuSelectedHandler} />
    }

    renderItemActionMenuItems = (anchor?: HTMLElement | null) => {
        const id = anchor?.dataset.id;
        if (!id) return;

        const { umis, renderers } = this.state;
        const { dataContext: ctx } = this.props;

        const item = ctx?.source?.items?.find(i => i.id === id);
        if (!item) return;

        const umiAcceptable = !!umis.length && (DIDLTools.isContainer(item) || DIDLTools.isMusicTrack(item));
        const rendererAcceptable = !!renderers.length && DIDLTools.isMediaItem(item);

        return <>
            {this.renderMenu(umiAcceptable, rendererAcceptable, umis, renderers)}
            {(umiAcceptable || rendererAcceptable) &&
                <li><hr className="dropdown-divider mx-2" /></li>}
            <MenuItem action={"info"} glyph="info">Get Info</MenuItem>
        </>;
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
        this.setState({ fetching: true, error: undefined });
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
                {umis.map(({ udn, name }) => renderActionMenuItem(udn, "send", name))}
            </>}
            {(umiAcceptable || rendererAcceptable) && <>
                <li><h6 className="dropdown-header">Play on</h6></li>
                {umiAcceptable && umis.map(({ udn, name }) => renderActionMenuItem(udn, "play", name))}
                {rendererAcceptable && renderers.map(({ udn, name }) => renderActionMenuItem(udn, "play", name))}
            </>}
        </>;
    }

    render() {
        const { dataContext: data, p: page, s: size } = this.props;
        const parents = data?.source.parents ?? [];
        return <>
            <BrowserSvgSymbols />
            <RowStateProvider items={data?.source.items}>
                <BrowserCore mainCellTemplate={Template} mainCellContext={this.getCellContext()} withPagination={false} useCheckboxes multiSelect
                    {...this.props} fetching={this.state.fetching || this.props.fetching} open={this.openHandler}
                    renderActionMenu={this.renderActionMenu}>
                    <DropdownMenu render={this.renderItemActionMenuItems} onSelected={this.itemMenuSelectedHandler} placement="left" />
                </BrowserCore>
            </RowStateProvider>
            <div className="sticky-bottom">
                <BottomBar>
                    <TablePagination total={data?.source.total ?? 0} current={typeof page === "string" ? parseInt(page) : 1}
                        pageSize={typeof size === "string" ? parseInt(size) : $s.get("pageSize")} />
                </BottomBar>
                {MediaQueries.largeScreen.matches && parents.length > 1 && <Breadcrumb className="border-top" items={parents} />}
            </div>
            <ModalHost ref={this.modalHostRef} />
        </>;
    }
}