import { createRef, PureComponent } from "react";
import { BottomBar } from "../../components/BottomBar";
import Breadcrumb from "../../components/Breadcrumb";
import DialogHost from "../../components/DialogHost";
import { Menu, MenuItem, MenuItemSeparator } from "../../components/Menu";
import { RowStateProvider } from "../../components/RowStateContext";
import { itemBookmarks } from "../../services/BookmarkService";
import { HotKey, HotKeys } from "../../services/HotKey";
import WebApi from "../../services/WebApi";
import { createBookmarkButton } from "./BookmarkButton";
import { BrowserActionMenu, renderActionMenuItem } from "./BrowserActionMenu";
import BrowserCore, { BrowserCoreProps } from "./BrowserCore";
import { CellTemplate, CellTemplateProps } from "./BrowserView";
import { isContainer, isMediaItem, isMusicTrack } from "./DIDLTools";
import ItemInfoDialog from "./ItemInfoDialog";
import Pagination from "./Pagination";
import $s from "./Settings";
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

const BookmarkItemButton = createBookmarkButton("ItemBookmarkWidget", itemBookmarks);

function Template(props: CellTemplateProps<CellContext>) {
    return <CellTemplate {...props}>
        {props.data.container && props.context?.deviceName &&
            <BookmarkItemButton item={props.data} device={props.context?.device as string} deviceName={props.context?.deviceName as string} />}
        <button type="button" className="btn btn-round" data-id={props.data.id}
            data-toggle="dropdown" disabled={props.context?.disabled}>
            <svg><use href="symbols.svg#more_vert" /></svg>
        </button>
    </CellTemplate>;
}

type BrowserState = {
    umis: Upnp.Device[],
    renderers: Upnp.Device[],
    fetching?: boolean,
    error?: unknown
}

type BrowserProps = BrowserCoreProps<CellContext> & { device: string; };

export class Browser extends PureComponent<BrowserProps, BrowserState> {
    dialogHostRef = createRef<DialogHost>();

    constructor(props: BrowserProps) {
        super(props);
        this.state = { umis: [], renderers: [] };
    }

    async componentDidMount() {
        try {
            const timeout = $s.get("timeout");
            const devices = await WebApi.devices("renderers").json(timeout);
            this.setState({ umis: devices.filter(UDT.isUmiDevice), renderers: devices.filter(d => !UDT.isUmiDevice(d)) })
        }
        catch (error) {
            console.error(error);
        }
    }

    getCellContext = (): CellContext => ({
        disabled: !(this.state.umis.length || this.state.renderers.length),
        device: this.props.device,
        deviceName: this.props.dataContext?.source.device?.name
    });

    openHandler = (item: Upnp.DIDL.Item) => {
        this.props.navigate(`../../view/${item.id}`);
        return true;
    }

    hotKeyHandler = (items: Upnp.DIDL.Item[], focused: Upnp.DIDL.Item | undefined, hotKey: HotKey) => {
        if (hotKey.equals(HotKeys.showInfo)) {
            this.dialogHostRef.current?.show(<ItemInfoDialog item={focused ?? items[0]} />);
            return false;
        }
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
            this.dialogHostRef.current?.show(<ItemInfoDialog item={item} />);
        }
    }

    actionMenuSelectedHandler = async (action: string, udn: string, selection: Upnp.DIDL.Item[]) => {
        const items = selection.filter(i => isContainer(i) || isMusicTrack(i))

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

        const umiAcceptable = !!umis.length && (isContainer(item) || isMusicTrack(item));
        const rendererAcceptable = !!renderers.length && isMediaItem(item);

        return <>
            {this.renderMenu(umiAcceptable, rendererAcceptable, umis, renderers)}
            {(umiAcceptable || rendererAcceptable) &&
                <MenuItemSeparator />}
            <MenuItem action={"info"} glyph="symbols.svg#info">Get Info</MenuItem>
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

    private renderMenu(umiAcceptable: boolean, rendererAcceptable: boolean, umis: Upnp.Device[], renderers: Upnp.Device[]) {
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
        const { dataContext: data, p: page, s: size, displayMode } = this.props;
        const parents = data?.source.parents ?? [];
        return <>
            <RowStateProvider items={data?.source.items}>
                <BrowserCore mainCellTemplate={Template} mainCellContext={this.getCellContext()} withPagination={false} useCheckboxes multiSelect
                    {...this.props} fetching={this.state.fetching || this.props.fetching} openHandler={this.openHandler} hotKeyHandler={this.hotKeyHandler}
                    renderActionMenu={this.renderActionMenu}>
                    <Menu render={this.renderItemActionMenuItems} onSelected={this.itemMenuSelectedHandler} />
                </BrowserCore>
            </RowStateProvider>
            <div className="sticky-bottom">
                <BottomBar className="flex-wrap-reverse">
                    {displayMode === "table" && parents.length > 1 && <Breadcrumb className="me-auto" items={parents} />}
                    <Pagination total={data?.source.total ?? 0} current={typeof page === "string" ? parseInt(page) : 1}
                        pageSize={typeof size === "string" ? parseInt(size) : $s.get("pageSize")} />
                </BottomBar>
            </div>
            <DialogHost ref={this.dialogHostRef} />
        </>
    }
}