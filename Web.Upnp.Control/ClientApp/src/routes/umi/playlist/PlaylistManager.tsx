import React, { EventHandler, HTMLAttributes, ReactElement, UIEvent } from "react";
import { DataContext, DataFetchProps } from "../../../components/DataFetch";
import { TextValueEditDialog } from "../../../components/Dialogs";
import { DropdownMenu, MenuItem } from "../../../components/DropdownMenu";
import { DropTarget } from "../../../components/DropTarget";
import { nopropagation } from "../../../components/Extensions";
import { PressHoldGestureRecognizer } from "../../../components/gestures/PressHoldGestureRecognizer";
import { LoadIndicatorOverlay } from "../../../components/LoadIndicator";
import { MediaQueries } from "../../../components/MediaQueries";
import { ModalProps } from "../../../components/Modal";
import ModalHost from "../../../components/ModalHost";
import { SignalRListener } from "../../../components/SignalR";
import Toolbar from "../../../components/Toolbar";
import $api from "../../../components/WebApi";
import { BottomBar } from "../../common/BottomBar";
import Breadcrumb from "../../common/Breadcrumb";
import { DIDLUtils, fromBaseQuery, withBrowserDataFetch } from "../../common/BrowserUtils";
import Browser, { BrowserProps } from "../../common/BrowserView";
import ItemInfoModal from "../../common/ItemInfoModal";
import { NavigatorProps } from "../../common/Navigator";
import { TablePagination } from "../../common/Pagination";
import $s from "../../common/Settings";
import { BrowserSvgSymbols, EditSvgSymbols, PlayerSvgSymbols, PlaylistSvgSymbols, PlaySvgSymbols } from "../../common/SvgSymbols";
import { AVState, BrowseFetchResult, DIDLItem, PlaylistRouteParams, PropertyBag, RowState } from "../../common/Types";
import MainCell from "./CellTemplate";
import { AddItemsModal } from "./dialogs/AddItemsModal";
import { AddUrlModal } from "./dialogs/AddUrlModal";
import { RemoveItemsModal } from "./dialogs/RemoveItemsModal";
import { UploadPlaylistModal } from "./dialogs/UploadPlaylistModal";

type PlaylistManagerProps = PlaylistRouteParams &
    DataFetchProps<BrowseFetchResult> &
    HTMLAttributes<HTMLDivElement> &
    NavigatorProps;

type PlaylistManagerState = {
    selection: string[];
    playlist?: string;
    ctx?: DataContext<BrowseFetchResult>;
    rowStates: RowState[];
    editMode: boolean;
} & Partial<AVState>;

const dialogBrowserProps: BrowserProps<unknown> = {
    multiSelect: true,
    useCheckboxes: true,
    rowStateProvider: item => item.container
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


function isReadonly(item: DIDLItem) {
    if (item.readonly) return true;
    const type = item?.vendor?.["mi:playlistType"];
    return type === "aux" || type === "usb";
}

function isNavigable(item: DIDLItem) {
    return item?.vendor?.["mi:playlistType"] !== "aux";
}

function getRowState(item: DIDLItem): RowState {
    return (isNavigable(item) ? RowState.Navigable : RowState.None)
        | (isReadonly(item) ? RowState.Readonly : RowState.Selectable);
}

export class PlaylistManagerCore extends React.Component<PlaylistManagerProps, PlaylistManagerState> {

    displayName = PlaylistManagerCore.name;
    modalHostRef = React.createRef<ModalHost>();
    browserNodeRef = React.createRef<HTMLDivElement>();
    pressHoldGestureRecognizer: PressHoldGestureRecognizer<HTMLDivElement>;
    handlers;
    ctrl;
    pls;

    static defaultProps = { id: "PL:" };

    constructor(props: PlaylistManagerProps) {
        super(props);
        this.handlers = new Map<string, (...args: any[]) => void>([["AVTransportEvent", this.onAVTransportEvent]]);
        this.state = { selection: [], editMode: false, rowStates: [] };
        this.ctrl = $api.control(this.props.device);
        this.pls = $api.playlist(this.props.device);
        MediaQueries.largeScreen.addEventListener("change", this.queryChangedHandler);
        this.pressHoldGestureRecognizer = new PressHoldGestureRecognizer<HTMLDivElement>(this.pressHoldHandler);
    }

    async componentDidUpdate(prevProps: PlaylistManagerProps) {
        if (prevProps.dataContext !== this.props.dataContext) {
            this.ctrl = $api.control(this.props.device);
            this.pls = $api.playlist(this.props.device);
        }
    }

    static getDerivedStateFromProps({ dataContext: propsCtx }: PlaylistManagerProps, { ctx: stateCtx }: PlaylistManagerState) {
        if (propsCtx && propsCtx !== stateCtx)
            return { ctx: propsCtx, selection: [], rowStates: propsCtx.source.items?.map(getRowState) }
        else
            return null;
    }

    async componentDidMount() {
        if (this.browserNodeRef.current) {
            this.pressHoldGestureRecognizer.bind(this.browserNodeRef.current);
        }

        try {
            const timeout = $s.get("timeout");
            const state = await this.ctrl.state(true).jsonFetch(timeout);
            if (state.medium === "X-MI-AUX") {
                this.setState({ ...state, playlist: "aux" });
            } else {
                const { 0: { "playlist_transport_uri": playlist }, 1: { currentTrack } } = await Promise.all([
                    await this.pls.state().jsonFetch(),
                    await this.ctrl.position().jsonFetch()
                ]);
                this.setState({ ...state, playlist, currentTrack });
            }
        } catch (e) {
            console.error(e);
        }
    }

    componentWillUnmount() {
        this.pressHoldGestureRecognizer.unbind();
        MediaQueries.largeScreen.removeEventListener("change", this.queryChangedHandler);
    }

    onAVTransportEvent = (device: string, { state, vendorProps: { "mi:playlist_transport_uri": playlist, "mi:Transport": transport } = {} }:
        { state: AVState, vendorProps: PropertyBag }) => {
        if (device === this.props.device) {
            this.setState({ ...state, playlist: transport === "AUX" ? "aux" : playlist });
        }
    }

    private queryChangedHandler = () => this.forceUpdate();

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

    private copy = (id: string, title: string) => this.reload($api.playlist(this.props.device).copy(id, title).fetch);

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

    private removePlaylists = (ids: string[]) => {

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

    private copyPlaylist = (id: string) => {
        const title = this.props.dataContext?.source.items?.find(e => e.id === id)?.title;
        this.copy(id, `${title} - Copy`);
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

    private removeClickHandler = () => this.removePlaylists(this.state.selection);

    private renameClickHandler = () => this.renamePlaylist(this.state.selection[0]);

    private copyClickHandler = () => this.copyPlaylist(this.state.selection[0]);

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

    private play: EventHandler<UIEvent<HTMLElement>> = nopropagation(() => this.ctrl.play().fetch());

    private pause: EventHandler<UIEvent<HTMLElement>> = nopropagation(() => this.ctrl.pause().fetch());

    private playUrl: EventHandler<UIEvent<HTMLElement>> = nopropagation(({ currentTarget: { dataset: { index } } }) => {
        if (index) this.playItem(parseInt(index));
    });

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
            case "delete": this.removePlaylists([id]); break;
            case "rename": this.renamePlaylist(id); break;
            case "copy": this.copyPlaylist(id); break;
            case "remove": this.removePlaylistItems([id]); break;
            case "play": if (anchor?.dataset?.index) this.playItem(parseInt(anchor.dataset.index)); break;
            case "pause": this.ctrl.pause().fetch(); break;
            case "info": this.showInfo(id); break;
        }
    }

    //#endregion

    navigateBackHandler = () => {
        const id = this.props.dataContext?.source.parents?.[1]?.id ?? "-1";
        this.props.navigate?.({ id });
    }

    toggleEditMode = () => {
        this.setState(({ editMode }) => ({ editMode: !editMode }));
    }

    pressHoldHandler = () => {
        this.toggleEditMode();
    }

    toggleSelectAllHandler = () => {
        if (this.state.rowStates.some(rs => (rs & RowState.SelectMask) === RowState.Selectable)) {
            this.setState(({ rowStates }) => {
                this.setStateFlag(rowStates, RowState.Selected);
                return {
                    selection: this.props.dataContext?.source.items?.
                        filter((_, i) => this.state.rowStates[i] & RowState.Selectable).
                        map(i => i.id) ?? [], rowStates
                };
            })
        } else {
            this.setState(({ rowStates }) => {
                this.resetStateFlag(rowStates, RowState.Selected);
                return { selection: [], rowStates };
            });
        }
    }

    private resetStateFlag = (states: RowState[], flag: RowState) => {
        for (let i = 0; i < states.length; i++)
            states[i] &= ~flag;
    }

    private setStateFlag = (states: RowState[], flag: RowState) => {
        for (let i = 0; i < states.length; i++)
            states[i] |= flag;
    }

    private renderTopBar = (expanded: boolean, fetching: boolean) => {
        const className = "btn-round btn-icon btn-plain flex-grow-0";
        const selectedCount = this.state.selection.length;
        const hasNoSelection = selectedCount === 0;
        const onlySelected = selectedCount === 1;
        return this.state.editMode ? <>
            <Toolbar.Button key="close" glyph="close" onClick={this.toggleEditMode} className={className} />
            <small className="flex-fill my-0 mx-2 text-center text-truncate">
                {selectedCount ? `${selectedCount} item${selectedCount > 1 ? "s" : ""} selected` : ""}
            </small>{this.props.id === "PL:" ? <>
                <Toolbar.Button glyph="trash" title="Delete" onClick={this.removeClickHandler} className={className} disabled={hasNoSelection} />
                <Toolbar.Button glyph="edit" title="Rename" onClick={this.renameClickHandler} className={className} disabled={!onlySelected} />
                <Toolbar.Button glyph="copy" title="Copy" onClick={this.copyClickHandler} className={className} disabled={!onlySelected} />
            </> :
                <Toolbar.Button glyph="trash" title="Delete items" onClick={this.removeItemsClickHandler} className={className} disabled={hasNoSelection} />}
            <Toolbar.Button key="check-all" glyph="ui-checks" onClick={this.toggleSelectAllHandler} className={className} />
        </> : <>
            <Toolbar.Button key="nav-parent" glyph="chevron-left" onClick={this.navigateBackHandler} className={className} />
            <div className="vstack align-items-stretch overflow-hidden text-center text-md-start mx-2">
                <h6 className="mb-0 text-truncate">{this.props.dataContext?.source.parents?.[0]?.title ?? "\xa0"}</h6>
                <small className="text-muted text-truncate">{this.props.dataContext?.source.dev?.name ?? "\xa0"}</small>
            </div>
            {expanded ? <>{
                this.props.id === "PL:" ? <>
                    <Toolbar.Button glyph="plus" title="Add new" onClick={this.addClickHandler} className={className} disabled={fetching} />
                    <Toolbar.Button glyph="trash" title="Delete" onClick={this.removeClickHandler} className={className} disabled={fetching || hasNoSelection} />
                    <Toolbar.Button glyph="edit" title="Rename" onClick={this.renameClickHandler} className={className} disabled={fetching || !onlySelected} />
                    <Toolbar.Button glyph="copy" title="Copy" onClick={this.copyClickHandler} className={className} disabled={fetching || !onlySelected} />
                </> : <>
                    <Toolbar.Button glyph="plus" title="Add from media server" onClick={this.addItemsClickHandler} className={className} disabled={fetching} />
                    <Toolbar.Button glyph="broadcast-tower" title="Add Internet stream url" onClick={this.addUrlClickHandler} className={className} disabled={fetching} />
                    <Toolbar.Button glyph="list" title="Add from playlist file" onClick={this.uploadPlaylistClickHandler} className={className} disabled={fetching} />
                    <Toolbar.Button glyph="trash" title="Delete items" onClick={this.removeItemsClickHandler} className={className} disabled={fetching || hasNoSelection} />
                </>
            }
            </> :
                <Toolbar.Button key="edit-mode" glyph="pen" onClick={this.toggleEditMode} className={className} disabled={fetching} />}
        </>;
    }

    renderContextMenu = (anchor?: HTMLElement | null) => {
        const active = anchor?.dataset?.index ? this.state.rowStates[parseInt(anchor.dataset.index)] & RowState.Active : false;
        return <>
            {active && this.state.state === "PLAYING"
                ? <MenuItem action="pause" glyph="pause">Pause</MenuItem>
                : <MenuItem action="play" glyph="play">Play</MenuItem>}
            {this.props.id === "PL:"
                ? <>
                    <MenuItem action="add-items" glyph="plus">Add from media server</MenuItem>
                    <MenuItem action="add-url" glyph="broadcast-tower">Add Internet stream url</MenuItem>
                    <MenuItem action="add-files" glyph="list">Add from playlist file</MenuItem>
                    <MenuItem action="rename" glyph="edit">Rename</MenuItem>
                    <MenuItem action="delete" glyph="trash">Delete</MenuItem>
                    <MenuItem action="copy" glyph="copy">Copy</MenuItem>
                </>
                : <>
                    <MenuItem action="remove" glyph="trash">Delete item</MenuItem>
                </>}
            <MenuItem action="info" glyph="info">Get Info</MenuItem>
        </>;
    }

    renderActionMenu = () => {
        return <>
            <MenuItem action="add-items" key="add-items" glyph="plus" onClick={this.addItemsClickHandler}>From media server</MenuItem>
            <MenuItem action="add-url" key="add-url" glyph="broadcast-tower" onClick={this.addUrlClickHandler}>Internet stream url</MenuItem>
            <MenuItem action="add-files" key="add-files" glyph="list" onClick={this.uploadPlaylistClickHandler}>Upload playlist file</MenuItem>
        </>;
    }

    render() {

        const { dataContext: data, navigate, fetching, error, id, s, p, device } = this.props;
        const { playlist, currentTrack } = this.state;
        const { source: { total = 0, items = [], parents = [], dev = undefined } = {} } = data || {};
        const pageSize = s ? parseInt(s) : $s.get("pageSize");
        const page = p ? parseInt(p) : 1;

        const fetched = items.length;
        const isRootLevel = id === "PL:";
        const hasSelection = this.state.selection.length > 0;

        const activeIndex = this.props.id === "PL:"
            ? this.state.playlist === "aux" ? items.findIndex(i => i.vendor?.["mi:playlistType"] === "aux") : items.findIndex(i => i.res?.url === playlist)
            : currentTrack && playlist === parents?.[0]?.res?.url ? parseInt(currentTrack) - pageSize * (page - 1) - 1 : -1;

        if (activeIndex >= 0 && this.state.rowStates.length) {
            this.resetStateFlag(this.state.rowStates, RowState.Active);
            this.state.rowStates[activeIndex] |= RowState.Active;
        }

        const ctx = {
            play: this.play,
            pause: this.pause,
            playUrl: this.playUrl,
            state: this.state.state,
            device: device,
            deviceName: this.props.dataContext?.source.dev?.name
        };

        const largeScreen = MediaQueries.largeScreen.matches;
        const hasTouch = MediaQueries.touchDevice.matches;

        return <>
            <EditSvgSymbols />
            <PlaySvgSymbols />
            <PlaylistSvgSymbols />
            <PlayerSvgSymbols />
            <BrowserSvgSymbols />
            <SignalRListener handlers={this.handlers} />
            {fetching && <LoadIndicatorOverlay />}
            <DropTarget className="vstack overflow-hidden" acceptedTypes={fileTypes} onDropped={this.dropFilesHandler}>
                <Toolbar className="px-2 py-1 bg-white border-bottom flex-nowrap">
                    {this.renderTopBar(largeScreen, fetching)}
                </Toolbar>
                <Browser nodeRef={this.browserNodeRef} dataContext={data} fetching={fetching} error={error} mainCellTemplate={MainCell} mainCellContext={ctx}
                    selectionChanged={this.selectionChanged} navigate={navigate} open={this.playItem} rowStateProvider={this.state.rowStates}
                    className={"flex-fill mb-1" + (largeScreen ? "" : " pb-5")} editMode={this.state.editMode} useLevelUpRow={false}
                    useCheckboxes={this.state.editMode || hasTouch && largeScreen}>
                    <Browser.ItemActionMenu onSelected={this.menuSelectedHandler} render={this.renderContextMenu} />
                </Browser>
                <div className="sticky-bottom">
                    {!largeScreen && !fetching &&
                        <div className="position-relative d-flex justify-content-center justify-content-sm-end">
                            <div className="float-container position-absolute bottom-0">
                                <button type="button" className="btn btn-round btn-primary"
                                    onClick={isRootLevel && !hasSelection ? this.addClickHandler : undefined}
                                    data-bs-toggle={(hasSelection || !isRootLevel) ? "dropdown" : undefined}>
                                    <svg className="icon"><use href="#plus" /></svg>
                                </button>
                            </div>
                            <DropdownMenu render={this.renderActionMenu} />
                        </div>}
                    <BottomBar>
                        {this.state.selection.length > 0 ? <span className="text-muted me-auto small d-none d-sm-inline text-truncate">{`${this.state.selection.length} of ${fetched} selected`}</span> : null}
                        <TablePagination total={total} current={page} pageSize={pageSize} />
                    </BottomBar>
                    {largeScreen && <Breadcrumb className="border-top" items={parents} />}
                </div>
                <ModalHost ref={this.modalHostRef} />
            </DropTarget >
        </>;
    }
}

const browsePlaylistsQueryBuilder = fromBaseQuery((device, id) => $api.browse(device).get(id ?? PlaylistManagerCore.defaultProps.id)
    .withOptions({ withParents: true, withResourceProps: true, withVendorProps: true }));

export default withBrowserDataFetch(PlaylistManagerCore, false, browsePlaylistsQueryBuilder);