import React, { EventHandler, HTMLAttributes, ReactElement, UIEvent } from "react";
import { RouteComponentProps } from "react-router";
import { AVState, BrowseFetchResult, DIDLItem, PlaylistRouteParams, PropertyBag, RowState, UpnpDevice } from "../../common/Types";
import $api from "../../../components/WebApi";
import { TextValueEditDialog } from "../../../components/Dialogs";
import { withBrowserDataFetch, fromBaseQuery, DIDLUtils } from "../../common/BrowserUtils";
import Toolbar from "../../../components/Toolbar";
import { TablePagination } from "../../common/Pagination";
import Breadcrumb from "../../common/Breadcrumb";
import Browser, { BrowserProps } from "../../common/BrowserView";
import { LoadIndicatorOverlay } from "../../../components/LoadIndicator";
import { SignalRListener } from "../../../components/SignalR";
import MainCell from "./CellTemplate";
import { DataContext, DataFetchProps } from "../../../components/DataFetch";
import { NavigatorProps } from "../../common/Navigator";
import { AddUrlModal } from "./dialogs/AddUrlModal";
import { AddItemsModal } from "./dialogs/AddItemsModal";
import { RemoveItemsModal } from "./dialogs/RemoveItemsModal";
import { UploadPlaylistModal } from "./dialogs/UploadPlaylistModal";
import { DropTarget } from "../../../components/DropTarget";
import { BrowserSvgSymbols, EditSvgSymbols, PlayerSvgSymbols, PlaylistSvgSymbols, PlaySvgSymbols } from "../../common/SvgSymbols";
import $s from "../../common/Settings";
import { DropdownMenu, MenuItem } from "../../../components/DropdownMenu";
import { BottomBar } from "../../common/BottomBar";
import ModalHost from "../../../components/ModalHost";
import { ModalProps } from "../../../components/Modal";
import ItemInfoModal from "../../common/ItemInfoModal";

type PlaylistManagerProps = PlaylistRouteParams &
    DataFetchProps<BrowseFetchResult> &
    HTMLAttributes<HTMLDivElement> &
    NavigatorProps &
    RouteComponentProps;

type PlaylistManagerState = {
    selection: string[];
    playlist?: string;
    device: UpnpDevice | null;
    ctx?: DataContext<BrowseFetchResult>
} & Partial<AVState>;

const dialogBrowserProps: BrowserProps<unknown> = {
    multiSelect: true,
    useCheckboxes: true,
    rowState: item => item.container
        ? RowState.Navigable | RowState.Selectable
        : DIDLUtils.isMusicTrack(item)
            ? RowState.Selectable
            : RowState.None
}

const fileTypes = ["audio/mpegurl", "audio/x-mpegurl"];

type PlaylistAction = "create" | "add-items" | "add-url" | "add-files" | "rename" | "delete" | "copy";

type ItemAction = "remove";

type PlaybackAction = "play" | "pause" | "stop";

type Action = PlaylistAction | ItemAction | PlaybackAction | "info";

type ToolbarItem = [Action, string | undefined, string | undefined, () => void, boolean | undefined];

function isReadonly(item: DIDLItem) {
    if (item.readonly) return true;
    const type = item?.vendor?.["mi:playlistType"];
    return type === "aux" || type === "usb";
}

function isNavigable(item: DIDLItem) {
    return item?.vendor?.["mi:playlistType"] !== "aux";
}

export class PlaylistManagerCore extends React.Component<PlaylistManagerProps, PlaylistManagerState> {

    displayName = PlaylistManagerCore.name;
    rowStates: RowState[] = [];
    handlers;
    ctrl;
    pls;
    modalHostRef = React.createRef<ModalHost>();

    static defaultProps = { id: "PL:" };

    constructor(props: PlaylistManagerProps) {
        super(props);
        this.handlers = new Map<string, (...args: any[]) => void>([["AVTransportEvent", this.onAVTransportEvent]]);
        this.state = { selection: [], device: null };
        this.ctrl = $api.control(this.props.device);
        this.pls = $api.playlist(this.props.device);
    }

    async componentDidUpdate(prevProps: PlaylistManagerProps) {
        if (prevProps.dataContext !== this.props.dataContext) {
            this.ctrl = $api.control(this.props.device);
            this.pls = $api.playlist(this.props.device);
            this.rowStates = this.props.dataContext?.source.items?.map(this.getRowState) ?? [];
        }
    }

    static getDerivedStateFromProps({ dataContext: propsCtx }: PlaylistManagerProps, { ctx: stateCtx }: PlaylistManagerState) {
        if (propsCtx && propsCtx !== stateCtx)
            return { ctx: propsCtx, selection: [] }
        else
            return null;
    }

    async componentDidMount() {
        try {
            const timeout = $s.get("timeout");
            const state = await this.ctrl.state(true).jsonFetch(timeout);
            const device: UpnpDevice = await $api.devices("upnp", this.props.device).jsonFetch(timeout);
            if (state.medium === "X-MI-AUX") {
                this.setState({ ...state, playlist: "aux", device });
            } else {
                const { 0: { "playlist_transport_uri": playlist }, 1: { currentTrack } } = await Promise.all([
                    await this.pls.state().jsonFetch(),
                    await this.ctrl.position().jsonFetch()
                ]);
                this.setState({ ...state, playlist, currentTrack, device });
            }
        } catch (e) {
            console.error(e);
        }
    }

    onAVTransportEvent = (device: string, { state, vendorProps: { "mi:playlist_transport_uri": playlist, "mi:Transport": transport } = {} }:
        { state: AVState, vendorProps: PropertyBag }) => {
        if (device === this.props.device) {
            this.setState({ ...state, playlist: transport === "AUX" ? "aux" : playlist });
        }
    }

    private selectionChanged = (ids: string[]) => {
        this.setState({ selection: ids });
        return false;
    }

    private modal(modal: ReactElement<ModalProps>) {
        this.modalHostRef.current?.show(modal);
    }

    //#region API calls wrapped with UI indication and automatic data reload

    private reload = (action?: () => Promise<any>) => this.props.dataContext ? this.props.dataContext.reload(action) : Promise.resolve(null);

    private rename = (id: string, title: string) => this.reload($api.playlist(this.props.device).rename(id, title).fetch);

    private create = (title: string) => this.reload($api.playlist(this.props.device).create(title).fetch);

    private remove = (ids: string[]) => this.reload(() => $api.playlist(this.props.device).delete(ids).fetch());

    private addItems = (id: string, device: string, ids: string[]) => this.reload(() => $api
        .playlist(this.props.device)
        .addItems(id, device, ids, $s.get("containerScanDepth"))
        .fetch($s.get("containerScanTimeout")));

    private addUrl = (id: string, url: string, title?: string, useProxy?: boolean) => this.reload($api.playlist(this.props.device).addUrl(id, url, title, useProxy).fetch);

    private addFiles = (id: string, data: FormData) => this.reload($api.playlist(this.props.device).addFromFiles(id, data).fetch);

    private removeItems = (ids: string[]) => this.reload(() => $api.playlist(this.props.device).removeItems(this.props.id, ids).fetch());

    private showInfo = (id: string) => {
        var item = this.props.dataContext?.source.items?.find(i => i.id === id);
        if (!item) return;
        this.modal(<ItemInfoModal item={item} />);
    }

    //#endregion

    //#region Action UI modal state triggers

    private removePlaylist = (ids: string[]) => {

        const values = this.props.dataContext?.source.items?.filter(e => ids.includes(e.id));
        const onRemove = () => this.remove(ids);

        this.modal(<RemoveItemsModal title="Do you want to delete playlist(s)?" onRemove={onRemove}>
            <ul className="list-unstyled">
                {[values?.map(e => <li key={e.id}>{e.title}</li>)]}
            </ul>
        </RemoveItemsModal>);
    }

    private renamePlaylist = (id: string) => {
        const title = this.props.dataContext?.source.items?.find(e => e.id === id)?.title;
        const onRename = (value: string) => this.rename(id, value);

        this.modal(<TextValueEditDialog title="Rename playlist" label="Name" confirmText="Rename" defaultValue={title} onConfirmed={onRename} />);
    }

    private removePlaylistItems = (ids: string[]) => {
        const values = this.props.dataContext?.source.items?.filter(e => ids.includes(e.id));
        const onRemove = () => this.removeItems(ids);

        this.modal(<RemoveItemsModal onRemove={onRemove}>
            <ul className="list-unstyled">{[values?.map(e => <li key={e.id}>{e.title}</li>)]}</ul>
        </RemoveItemsModal>);
    }

    private addPlaylistItems = (id: string) => this.modal(<AddItemsModal browserProps={dialogBrowserProps}
        onConfirmed={({ device, keys }) => this.addItems(id, device, keys)} />);


    private addPlaylistUrl = (id: string) => {
        const addUrl = (url: string, title?: string, useProxy?: boolean) => this.addUrl(id, url, title, useProxy);
        return this.modal(<AddUrlModal useProxy={$s.get("useDlnaProxy")} onAdd={addUrl} />);
    }

    private addPlaylistFiles = (id: string) => {
        const addFiles = (data: FormData) => this.addFiles(id, data);
        return this.modal(<UploadPlaylistModal useProxy={$s.get("useDlnaProxy")} onAdd={addFiles} />);
    }

    //#endregion

    //#region Toolbar button click handlers 

    private addClickHandler = () => this.modal(<TextValueEditDialog title="Create new playlist" label="Name" confirmText="Create" defaultValue="New Playlist" onConfirmed={this.create} />);

    private removeClickHandler = () => this.removePlaylist(this.state.selection);

    private renameClickHandler = () => this.renamePlaylist(this.state.selection[0]);

    private copyClickHandler = () => { alert("not implemented yet"); };

    private addItemsClickHandler = () => this.addPlaylistItems(this.props.id);

    private addUrlClickHandler = () => this.addPlaylistUrl(this.props.id);

    private uploadPlaylistClickHandler = () => this.addPlaylistFiles(this.props.id);

    private removeItemsClickHandler = () => this.removePlaylistItems(this.state.selection);

    //#endregion

    //#region Drag&Drop handler

    private dropFilesHandler = (files: Iterable<File>) => {
        const useProxy = $s.get("useDlnaProxy");
        const request = this.props.id === "PL:"
            ? $api.playlist(this.props.device).createFromFiles(files, null, false, useProxy)
            : $api.playlist(this.props.device).addFromFiles(this.props.id, files, useProxy);
        this.reload(request.fetch);
        return true;
    }

    //#endregion

    //#region Playback related row event handlers

    private play: EventHandler<UIEvent<HTMLElement>> = () => this.ctrl.play().fetch();

    private pause: EventHandler<UIEvent<HTMLElement>> = () => this.ctrl.pause().fetch();

    private playUrl: EventHandler<UIEvent<HTMLElement>> = ({ currentTarget: { dataset: { index } } }) => {
        if (index) this.playItem(parseInt(index));
    }

    private playItem = (index: number) => {
        const url = this.getPlayUrl(index);
        if (url) this.ctrl.playUri(url).fetch();
        return false;
    }

    private getPlayUrl(index: number) {
        const { dataContext, s, p } = this.props;
        const { items = [], parents = [] } = dataContext?.source ?? {};
        const item = items[index];
        if (!item || !item.res) return;

        return item.container
            ? `${item.res.url}#play`
            : `${parents[0]?.res?.url}#tracknr=${(p ? parseInt(p) - 1 : 0) * (s ? parseInt(s) : $s.get("pageSize")) + index + 1},play`;
    }

    //#endregion

    //#region Context menu select handler

    private menuSelectedHandler = (item: HTMLElement, anchor?: HTMLElement) => {
        const id = anchor?.dataset["id"];
        if (!id) return;

        switch (item.dataset["action"] as Action) {
            case "add-items": this.addPlaylistItems(id); break;
            case "add-url": this.addPlaylistUrl(id); break;
            case "add-files": this.addPlaylistFiles(id); break;
            case "delete": this.removePlaylist([id]); break;
            case "rename": this.renamePlaylist(id); break;
            case "copy": break;
            case "remove": this.removePlaylistItems([id]); break;
            case "play": if (anchor?.dataset?.index) this.playItem(parseInt(anchor.dataset.index)); break;
            case "pause": this.ctrl.pause().fetch(); break;
            case "info": this.showInfo(id); break;
        }
    }

    //#endregion

    getRowState(item: DIDLItem, index: number): RowState {
        return (isNavigable(item) ? RowState.Navigable : RowState.None)
            | (isReadonly(item) ? RowState.Readonly : RowState.Selectable);
    }

    private getToolbarConfig = (): ToolbarItem[] => {
        const disabled = this.state.selection.length === 0;
        return this.props.id === "PL:" ?
            [
                ["create", "Add new", "plus", this.addClickHandler, undefined],
                ["delete", "Delete", "trash", this.removeClickHandler, disabled],
                ["rename", "Rename", "edit", this.renameClickHandler, this.state.selection.length !== 1],
                ["copy", "Copy", "copy", this.copyClickHandler, disabled]
            ] :
            [
                ["add-items", "Add items", "plus", this.addItemsClickHandler, undefined],
                ["add-url", "Add stream url", "broadcast-tower", this.addUrlClickHandler, undefined],
                ["add-files", "Add from playlist file", "list", this.uploadPlaylistClickHandler, undefined],
                ["remove", "Remove items", "trash", this.removeItemsClickHandler, disabled]
            ];
    }

    renderContextMenu = (anchor?: HTMLElement | null) => {
        const active = anchor?.dataset?.index ? this.rowStates[parseInt(anchor.dataset.index)] & RowState.Active : false;
        return <>
            {active && this.state.state === "PLAYING"
                ? <MenuItem action="pause" glyph="pause">Pause</MenuItem>
                : <MenuItem action="play" glyph="play">Play</MenuItem>}
            {this.props.id === "PL:"
                ? <>
                    <li><hr className="dropdown-divider mx-2" /></li>
                    <MenuItem action="add-items" glyph="plus">Add items</MenuItem>
                    <MenuItem action="add-url" glyph="broadcast-tower">Add stream url</MenuItem>
                    <MenuItem action="add-files" glyph="list">Add playlist file</MenuItem>
                    <li><hr className="dropdown-divider mx-2" /></li>
                    <MenuItem action="rename" glyph="edit">Rename</MenuItem>
                    <MenuItem action="delete" glyph="trash">Delete</MenuItem>
                    <MenuItem action="copy" glyph="copy">Copy</MenuItem>
                </>
                : <>
                    <li><hr className="dropdown-divider mx-2" /></li>
                    <MenuItem action="remove" glyph="trash">Remove item</MenuItem>
                </>}
            <li><hr className="dropdown-divider mx-2" /></li>
            <MenuItem action="info" glyph="info">Get Info</MenuItem>
        </>;
    };

    renderActionMenu = () => this.getToolbarConfig().filter(c => !c[4]).map(c =>
        <MenuItem action={c[0]} key={c[0]} glyph={c[2]} onClick={c[3]} disabled={c[4]}>{c[1]}</MenuItem>);

    render() {

        const { dataContext: data, match, navigate, fetching, error, id, s, p, device, location, history } = this.props;
        const { playlist, currentTrack } = this.state;
        const { source: { total = 0, items = [], parents = [] } = {} } = data || {};
        const pageSize = s ? parseInt(s) : $s.get("pageSize");
        const page = p ? parseInt(p) : 1;

        const fetched = items.length;
        const isRootLevel = id === "PL:";
        const hasSelection = this.state.selection.length > 0;

        const activeIndex = this.props.id === "PL:"
            ? this.state.playlist === "aux" ? items.findIndex(i => i.vendor?.["mi:playlistType"] === "aux") : items.findIndex(i => i.res?.url === playlist)
            : currentTrack && playlist === parents?.[0]?.res?.url ? parseInt(currentTrack) - pageSize * (page - 1) - 1 : -1;

        if (activeIndex >= 0 && this.rowStates.length) {
            for (let i = 0; i < this.rowStates.length; i++) this.rowStates[i] &= ~RowState.Active;
            this.rowStates[activeIndex] |= RowState.Active;
        }

        const ctx = {
            play: this.play,
            pause: this.pause,
            playUrl: this.playUrl,
            state: this.state.state,
            device: device,
            deviceName: this.state.device?.name
        };

        return <div className="h-100 overflow-auto safari-scroll-fix d-flex flex-column">
            <EditSvgSymbols />
            <PlaySvgSymbols />
            <PlaylistSvgSymbols />
            <PlayerSvgSymbols />
            <BrowserSvgSymbols />
            {fetching && <LoadIndicatorOverlay />}
            <DropTarget className="flex-fill d-flex flex-column" acceptedTypes={fileTypes} onDropped={this.dropFilesHandler}>
                <div className="d-flex flex-column sticky-top">
                    <Toolbar className="px-2 py-1 bg-white">
                        <Toolbar.Group>
                            {this.getToolbarConfig().map(i => <Toolbar.Button key={i[0]} title={i[1]} glyph={i[2]} onClick={i[3]} disabled={i[4]} className="btn-round btn-icon btn-plain" />)}
                        </Toolbar.Group>
                    </Toolbar>
                    <Breadcrumb className="border-bottom d-none-h-before-sm border-top" items={parents} path={match.path} params={match.params} />
                </div>
                <SignalRListener handlers={this.handlers}>
                    <Browser dataContext={data} fetching={fetching} error={error} mainCellTemplate={MainCell} mainCellContext={ctx}
                        selectionChanged={this.selectionChanged} navigate={navigate} open={this.playItem} rowState={this.rowStates}
                        useCheckboxes multiSelect className="flex-fill">
                        <Browser.ContextMenu onSelected={this.menuSelectedHandler} render={this.renderContextMenu} />
                    </Browser>
                </SignalRListener>
                <div className="sticky-bottom d-flex flex-column">
                    <div className="position-relative d-flex justify-content-center justify-content-sm-end d-none-h-md">
                        <div className="float-container position-absolute bottom-0">
                            <button type="button" className="btn btn-round btn-primary"
                                onClick={isRootLevel && !hasSelection ? this.addClickHandler : undefined}
                                data-bs-toggle={(hasSelection || !isRootLevel) ? "dropdown" : undefined}>
                                <svg className="icon"><use href={hasSelection ? "#edit" : "#plus"} /></svg>
                            </button>
                        </div>
                        <DropdownMenu render={this.renderActionMenu} />
                    </div>
                    <BottomBar className="position-static">
                        {this.state.selection.length > 0 ? <span className="text-muted me-auto small d-none d-sm-inline text-truncate">{`${this.state.selection.length} of ${fetched} selected`}</span> : null}
                        <TablePagination location={location} history={history} total={total} current={page} pageSize={pageSize} />
                    </BottomBar>
                </div>
                <ModalHost ref={this.modalHostRef} />
            </DropTarget >
        </div>;
    }
}

const browsePlaylistsQueryBuilder = fromBaseQuery((device, id) => $api.browse(device).get(id ?? PlaylistManagerCore.defaultProps.id)
    .withOptions({ withParents: true, withResourceProps: true, withVendorProps: true }));

export default withBrowserDataFetch(PlaylistManagerCore, false, browsePlaylistsQueryBuilder);