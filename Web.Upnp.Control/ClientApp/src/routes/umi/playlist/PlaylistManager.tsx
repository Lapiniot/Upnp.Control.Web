import React, { EventHandler, HTMLAttributes, ReactNode, UIEvent } from "react";
import { RouteComponentProps } from "react-router";
import { AVState, BrowseFetchResult, DIDLItem, PropertyBag } from "../../common/Types";
import $api from "../../../components/WebApi";
import { TextValueEditDialog } from "../../../components/Dialogs";
import { withBrowserDataFetch, fromBaseQuery, DIDLUtils } from "../../common/BrowserUtils";
import Toolbar from "../../../components/Toolbar";
import { TablePagination } from "../../common/Pagination";
import Breadcrumb from "../../common/Breadcrumb";
import Browser, { BrowserProps, RowState } from "../../common/BrowserView";
import { LoadIndicatorOverlay } from "../../../components/LoadIndicator";
import SelectionService from "../../../components/SelectionService";
import { SignalRListener } from "../../../components/SignalR";
import MainCell from "./CellTemplate";
import { DataFetchProps } from "../../../components/DataFetch";
import { NavigatorProps } from "../../common/Navigator";
import { AddUrlModalDialog } from "./dialogs/AddUrlModalDialog";
import { AddItemsModalDialog } from "./dialogs/AddItemsModalDialog";
import { RemoveItemsModalDialog } from "./dialogs/RemoveItemsModalDialog";
import { UploadPlaylistModalDialog } from "./dialogs/UploadPlaylistModalDialog";
import { DropTarget } from "../../../components/DropTarget";
import { PlayerSvgSymbols, PlaylistSvgSymbols } from "../../common/SvgSymbols";
import { Portal } from "../../../components/Portal";
import $s from "../../common/Config";
import { MenuItem } from "../../../components/DropdownMenu";

type RouteParams = {
    device: string;
    id: string;
    s?: string;
    p?: string;
};

type PlaylistManagerProps = RouteParams &
    DataFetchProps<BrowseFetchResult> &
    HTMLAttributes<HTMLDivElement> &
    NavigatorProps &
    RouteComponentProps;

type PlaylistManagerState = {
    modal: ReactNode;
    selection: string[];
    playlist?: string;
} & Partial<AVState>;

const dialogBrowserProps: BrowserProps<unknown> = {
    multiSelect: true,
    useCheckboxes: true,
    rowState: item => item.container
        ? RowState.Navigable
        : DIDLUtils.isMusicTrack(item)
            ? RowState.Selectable
            : RowState.None
}

const fileTypes = ["audio/mpegurl", "audio/x-mpegurl"];

type PlaylistAction = "create" | "add-items" | "add-url" | "add-files" | "rename" | "delete" | "copy";

type ItemAction = "remove";

type PlaybackAction = "play" | "pause" | "stop";

type Action = PlaylistAction | ItemAction | PlaybackAction;

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
    selection = new SelectionService();
    rowStates: RowState[] = [];
    handlers;
    ctrl;
    pls;

    constructor(props: PlaylistManagerProps) {
        super(props);
        this.handlers = new Map<string, (...args: any[]) => void>([["AVTransportEvent", this.onAVTransportEvent]]);
        this.state = { modal: null, selection: [] };
        this.ctrl = $api.control(this.props.device);
        this.pls = $api.playlist(this.props.device);
    }

    async componentDidUpdate(prevProps: PlaylistManagerProps) {
        if (prevProps.device !== this.props.device) {
            this.ctrl = $api.control(this.props.device);
            this.pls = $api.playlist(this.props.device);
        }
        if (prevProps.device !== this.props.device || prevProps.id !== this.props.id) {
            this.selection.reset();
        }
    }

    async componentDidMount() {
        try {
            const state = await this.ctrl.state(true).jsonFetch();
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

    private resetModal = () => { this.setState({ modal: null }); }

    //#region API calls wrapped with UI indication and automatic data reload

    private reload = (action?: () => Promise<any>) => this.props.dataContext ? this.props.dataContext.reload(action) : Promise.resolve(null);

    private rename = (id: string, title: string) => this.reload($api.playlist(this.props.device).rename(id, title).fetch);

    private create = (title: string) => this.reload($api.playlist(this.props.device).create(title).fetch);

    private remove = (ids: string[]) => this.reload(() => $api.playlist(this.props.device).delete(ids).fetch().then(this.selection.reset));

    private addItems = (id: string, device: string, ids: string[]) => this.reload($api.playlist(this.props.device).addItems(id, device, ids).fetch);

    private addUrl = (id: string, url: string, title?: string, useProxy?: boolean) => this.reload($api.playlist(this.props.device).addUrl(id, url, title, useProxy).fetch);

    private addFiles = (id: string, data: FormData) => this.reload($api.playlist(this.props.device).addFromFiles(id, data).fetch);

    private removeItems = (ids: string[]) => this.reload(() => $api.playlist(this.props.device).removeItems(this.props.id, ids).fetch().then(this.selection.reset));

    //#endregion

    //#region Action UI modal state triggers

    private removePlaylist = (ids: string[]) => {

        const values = this.props.dataContext?.source.items.filter(e => ids.includes(e.id));
        const onRemove = () => this.remove(ids);

        this.setState({
            modal: <RemoveItemsModalDialog id="remove-dialog" title="Do you want to delete playlist(s)?" onDismiss={this.resetModal} onRemove={onRemove}>
                <ul className="list-unstyled">
                    {[values?.map(e => <li key={e.id}>{e.title}</li>)]}
                </ul>
            </RemoveItemsModalDialog>
        });
    }

    private renamePlaylist = (id: string) => {
        const title = this.props.dataContext?.source.items.find(e => e.id === id)?.title;
        const onRename = (value: string) => this.rename(id, value);

        this.setState({
            modal: <TextValueEditDialog id="rename-confirm" title="Rename playlist" label="Name" confirmText="Rename"
                defaultValue={title} onConfirm={onRename} onDismiss={this.resetModal} immediate />
        });
    }

    private removePlaylistItems = (ids: string[]) => {
        const values = this.props.dataContext?.source.items.filter(e => ids.includes(e.id));
        const onRemove = () => this.removeItems(ids);

        this.setState({
            modal: <RemoveItemsModalDialog id="remove-items-dialog" onDismiss={this.resetModal} onRemove={onRemove}>
                <ul className="list-unstyled">
                    {[values?.map(e => <li key={e.id}>{e.title}</li>)]}
                </ul>
            </RemoveItemsModalDialog>
        });
    }

    private addPlaylistItems = (id: string) => {
        const addItems = (device: string, ids: string[]) => this.addItems(id, device, ids);
        return this.setState({ modal: <AddItemsModalDialog id="add-items-dialog" onDismiss={this.resetModal} onAdd={addItems} browserProps={dialogBrowserProps} /> });
    }

    private addPlaylistUrl = (id: string) => {
        const addUrl = (url: string, title?: string, useProxy?: boolean) => this.addUrl(id, url, title, useProxy);
        return this.setState({ modal: <AddUrlModalDialog id="add-url-dialog" onDismiss={this.resetModal} onAdd={addUrl} /> });
    }

    private addPlaylistFiles = (id: string) => {
        const addFiles = (data: FormData) => this.addFiles(id, data);
        return this.setState({ modal: <UploadPlaylistModalDialog id="upload-playlist-dialog" onDismiss={this.resetModal} onAdd={addFiles} /> });
    }

    //#endregion

    //#region Toolbar button click handlers 

    private addClickHandler = () => this.setState({ modal: <TextValueEditDialog id="create-dialog" title="Create new playlist" label="Name" confirmText="Create" defaultValue="New Playlist" onConfirm={this.create} onDismiss={this.resetModal} immediate /> });

    private removeClickHandler = () => this.removePlaylist(this.state.selection);

    private renameClickHandler = () => this.renamePlaylist(this.state.selection[0]);

    private copyClickHandler = () => { alert("not implemented yet"); };

    private addItemsClickHandler = () => this.addPlaylistItems(this.props.id);

    private addUrlClickHandler = () => this.addPlaylistUrl(this.props.id);

    private uploadPlaylistClickHandler = () => this.addPlaylistFiles(this.props.id);

    private removeItemsClickHandler = () => this.removePlaylistItems(this.state.selection);

    //#endregion

    //#region Drag&Drop handler

    private onDropFiles = (files: Iterable<File>) => {
        const request = this.props.id === "PL:"
            ? $api.playlist(this.props.device).createFromFiles(files, null, false)
            : $api.playlist(this.props.device).addFromFiles(this.props.id, files);
        this.reload(request.fetch);
        return true;
    }

    //#endregion

    //#region Playback related row event handlers

    private play: EventHandler<UIEvent<HTMLElement>> = () => this.ctrl.play().fetch();

    private pause: EventHandler<UIEvent<HTMLElement>> = () => this.ctrl.pause().fetch();

    private playUrl: EventHandler<UIEvent<HTMLElement>> = ({ currentTarget: { dataset: { id } } }) => {
        if (id) this.playItem(id);
    }

    private playItem = (id: string) => {
        const url = this.getPlayUrl(id);
        if (url) this.ctrl.playUri(url).fetch();
        return false;
    }

    private getPlayUrl(id: string) {
        const { dataContext, s, p } = this.props;
        const { items = [], parents = [] } = dataContext?.source ?? {};

        const index = items.findIndex(i => i.id === id);
        if (index === undefined || index < 0) return;

        const item = items[index];
        if (!item || !item.res) return;

        return item.container
            ? `${item.res.url}#play`
            : `${parents[0]?.res?.url}#tracknr=${(p ? parseInt(p) - 1 : 0) * (s ? parseInt(s) : $s.get("pageSize")) + index + 1},play`;
    }

    //#endregion

    //#region Context menu select handler

    private menuSelectHandler = (item: HTMLElement, anchor?: HTMLElement) => {
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
            case "play": if (anchor?.dataset?.id) this.playItem(anchor.dataset.id); break;
            case "pause": this.ctrl.pause().fetch(); break;
        }
    }

    //#endregion

    private getToolbarConfig = (): ToolbarItem[] => {
        const disabled = this.state.selection.length === 0;
        return this.props.id === "PL:" ?
            [
                ["create", "Create", "plus", this.addClickHandler, undefined],
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
                    <MenuItem action="" glyph=""></MenuItem>
                    <li><hr className="dropdown-divider mx-2" /></li>
                    <MenuItem action="rename" glyph="edit">Rename</MenuItem>
                    <MenuItem action="delete" glyph="trash">Delete</MenuItem>
                    <MenuItem action="copy" glyph="copy">Copy</MenuItem>
                </>
                : <>
                    <li><hr className="dropdown-divider mx-2" /></li>
                    <MenuItem action="remove" glyph="trash">Remove item</MenuItem>
                </>}
        </>;
    };

    render() {

        const { dataContext: data, match, navigate, fetching, error, id, s, p } = this.props;
        const { playlist, currentTrack } = this.state;
        const { source: { total = 0, items = [], parents = [] } = {} } = data || {};
        const pageSize = s ? parseInt(s) : $s.get("pageSize");
        const page = p ? parseInt(p) : 1;

        const fetched = items.length;

        const activeIndex = id === "PL:"
            ? playlist === "aux" ? items.findIndex(i => i.vendor?.["mi:playlistType"] === "aux") : items.findIndex(i => i.res?.url === playlist)
            : currentTrack && playlist === parents?.[0]?.res?.url ? parseInt(currentTrack) - pageSize * (page - 1) - 1 : -1;

        const getRowState = (item: DIDLItem, index: number) => RowState.None
            | (index === activeIndex ? RowState.Active : RowState.None)
            | (isReadonly(item) ? RowState.Readonly : RowState.Selectable)
            | (isNavigable(item) ? RowState.Navigable : RowState.None);

        this.rowStates = items.map(getRowState);

        const ctx = {
            play: this.play,
            pause: this.pause,
            playUrl: this.playUrl,
            state: this.state.state
        };

        return <>
            <PlaylistSvgSymbols />
            <PlayerSvgSymbols />
            {fetching && <LoadIndicatorOverlay />}
            <DropTarget className="flex-expand d-flex flex-column" acceptedTypes={fileTypes} onDrop={this.onDropFiles}>
                <div className="d-flex flex-column sticky-top">
                    <Toolbar className="px-2 py-1 bg-light border-bottom">
                        <Toolbar.Group>
                            {this.getToolbarConfig().map(i => <Toolbar.Button key={i[0]} title={i[1]} glyph={i[2]} onClick={i[3]} disabled={i[4]} className="btn-round" />)}
                        </Toolbar.Group>
                    </Toolbar>
                    <Breadcrumb className="border-bottom" items={parents} path={match.path} params={match.params} />
                </div>
                <SignalRListener handlers={this.handlers}>
                    <Browser dataContext={data} fetching={fetching} error={error} mainCellTemplate={MainCell} mainCellContext={ctx}
                        selection={this.selection} selectionChanged={this.selectionChanged} navigate={navigate} open={this.playItem} rowState={this.rowStates}
                        useCheckboxes multiSelect className="flex-expand">
                        <Browser.ContextMenu placement="bottom-end" onSelect={this.menuSelectHandler} render={this.renderContextMenu} />
                    </Browser>
                </SignalRListener>
                <div className="sticky-bottom bg-light py-1 px-3 d-flex align-items-center border-top">
                    {this.selection.length > 0 ? <span className="text-muted small">{`${this.selection.length} of ${fetched} selected`}</span> : null}
                    <TablePagination className="ms-auto" location={this.props.location} history={this.props.history} total={total} current={page} pageSize={pageSize} />
                </div>
                <Portal selector="#modal-root">{this.state.modal}</Portal>
            </DropTarget >
        </>;
    }
}

const browsePlaylistsQueryBuilder = fromBaseQuery((device, id) => $api.browse(device).get(id || "PL:").withParents().withResource().withVendor());

export default withBrowserDataFetch(PlaylistManagerCore, false, browsePlaylistsQueryBuilder);