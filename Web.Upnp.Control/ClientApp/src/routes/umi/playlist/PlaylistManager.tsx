import React, { EventHandler, HTMLAttributes, ReactNode, UIEvent } from "react";
import { RouteComponentProps } from "react-router";
import { AVState, BrowseFetchResult, DIDLItem, PropertyBag } from "../../common/Types";
import $api from "../../../components/WebApi";
import $config from "../../common/Config";
import { TextValueEditDialog } from "../../../components/Dialogs";
import { withBrowser, fromBaseQuery, DIDLUtils } from "../../common/BrowserUtils";
import Toolbar from "../../../components/Toolbar";
import Pagination from "../../common/Pagination";
import Breadcrumb from "../../common/Breadcrumb";
import Browser, { BrowserCoreProps, RowState } from "../../common/BrowserCore";
import { LoadIndicatorOverlay } from "../../../components/LoadIndicator";
import SelectionService from "../../../components/SelectionService";
import { SignalRListener } from "../../../components/SignalR";
import MainCell, { CellContext } from "./CellTemplate";
import { DataFetchProps } from "../../../components/DataFetch";
import { NavigatorProps } from "../../common/Navigator";
import { AddUrlModalDialog } from "./dialogs/AddUrlModalDialog";
import { AddItemsModalDialog } from "./dialogs/AddItemsModalDialog";
import { RemoveItemsModalDialog } from "./dialogs/RemoveItemsModalDialog";
import { UploadPlaylistModalDialog } from "./dialogs/UploadPlaylistModalDialog";
import { DropTarget } from "../../../components/DropTarget";
import { PlaylistSvgSymbols } from "../../common/SvgSymbols";

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
    selection: SelectionService;
    playlist?: string;
} & Partial<AVState>;

const browserProps: BrowserCoreProps = {
    multiSelect: true,
    selectOnClick: true,
    useCheckboxes: true,
    runsInDialog: true,
    rowState: item => DIDLUtils.isMusicTrack(item) ? RowState.Selectable : RowState.None
}

const fileTypes = ["audio/mpegurl", "audio/x-mpegurl"];

type PlaylistAction = "create" | "add-items" | "add-url" | "add-files" | "rename" | "delete" | "copy";

type ItemAction = "remove";

type PlaybackAction = "play" | "pause" | "stop";

type Action = PlaylistAction | ItemAction | PlaybackAction;

type MenuItem = [Action | string, string | undefined, string | undefined, boolean | undefined];

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
    selection;
    handlers;
    ctrl;
    pls;

    constructor(props: PlaylistManagerProps) {
        super(props);
        this.selection = new SelectionService();
        this.selection.addEventListener("changed", () => this.setState({ selection: this.selection }));
        this.handlers = new Map<string, (...args: any[]) => void>([["AVTransportEvent", this.onAVTransportEvent]]);
        this.state = { modal: null, selection: this.selection };
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

    resetModal = () => { this.setState({ modal: null }); }

    //#region API calls wrapped with UI indication and automatic data reload

    reload = (action?: () => Promise<any>) => this.props.dataContext ? this.props.dataContext.reload(action) : Promise.resolve(null);

    rename = (id: string, title: string) => this.reload($api.playlist(this.props.device).rename(id, title).fetch);

    create = (title: string) => this.reload($api.playlist(this.props.device).create(title).fetch);

    remove = (ids: string[]) => this.reload(() => $api.playlist(this.props.device).delete(ids).fetch().then(this.selection.reset));

    addItems = (id: string, device: string, ids: string[]) => this.reload($api.playlist(this.props.device).addItems(id, device, ids).fetch);

    addUrl = (id: string, url: string, title?: string, useProxy?: boolean) => this.reload($api.playlist(this.props.device).addUrl(id, url, title, useProxy).fetch);

    addFiles = (id: string, data: FormData) => this.reload($api.playlist(this.props.device).addFromFiles(id, data).fetch);

    removeItems = (ids: string[]) => this.reload(() => $api.playlist(this.props.device).removeItems(this.props.id, ids).fetch().then(this.selection.reset));

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
        return this.setState({ modal: <AddItemsModalDialog id="add-items-dialog" onDismiss={this.resetModal} onAdd={addItems} browserProps={browserProps} /> });
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

    addClickHandler = () => this.setState({ modal: <TextValueEditDialog id="create-dialog" title="Create new playlist" label="Name" confirmText="Create" defaultValue="New Playlist" onConfirm={this.create} onDismiss={this.resetModal} immediate /> });

    removeClickHandler = () => this.removePlaylist([...this.selection.keys]);

    renameClickHandler = () => this.renamePlaylist(this.selection.keys.next().value);

    copyClickHandler = () => { alert("not implemented yet"); };

    addItemsClickHandler = () => this.addPlaylistItems(this.props.id);

    addUrlClickHandler = () => this.addPlaylistUrl(this.props.id);

    uploadPlaylistClickHandler = () => this.addPlaylistFiles(this.props.id);

    removeItemsClickHandler = () => this.removePlaylistItems([...this.selection.keys]);

    //#endregion

    //#region Drag&Drop handler

    onDropFiles = (files: Iterable<File>) => {
        const request = this.props.id === "PL:"
            ? $api.playlist(this.props.device).createFromFiles(files, null, false)
            : $api.playlist(this.props.device).addFromFiles(this.props.id, files);
        this.reload(request.fetch);
        return true;
    }

    //#endregion

    //#region Playback related row event handlers

    play: EventHandler<UIEvent<HTMLElement>> = () => this.ctrl.play().fetch();

    pause: EventHandler<UIEvent<HTMLElement>> = () => this.ctrl.pause().fetch();

    playUrl: EventHandler<UIEvent<HTMLElement>> = ({ currentTarget: { dataset: { playIndex = "0" } } }) => {
        const index = parseInt(playIndex);
        const { dataContext, s, p } = this.props;
        const { items = [], parents = [] } = dataContext?.source ?? {};
        const url = parents[0]?.res?.url
            ? `${parents[0].res.url}#tracknr=${(p ? parseInt(p) - 1 : 0) * (s ? parseInt(s) : $config.pageSize) + index + 1},play`
            : `${items[index]?.res?.url}#play`;
        return this.ctrl.playUri(url).fetch();
    }

    open = (id: string) => {
        const index = this.props.dataContext?.source.items.findIndex(i => i.id === id) ?? -1;
        const url = this.props.dataContext?.source?.parents?.[0].res?.url;
        if (index >= 0 && url) {
            const playUrl = `${url}#tracknr=${index + 1},play`;
            this.ctrl.playUri(playUrl).fetch();
        }
        return false;
    }

    //#endregion

    //#region Context menu select handler

    menuSelectHandler = (item: HTMLElement, anchor?: HTMLElement) => {
        const id = anchor?.dataset["menuToggleFor"];
        if (!id) return;

        switch (item.dataset["action"] as Action) {
            case "add-items": this.addPlaylistItems(id); break;
            case "add-url": this.addPlaylistUrl(id); break;
            case "add-files": this.addPlaylistFiles(id); break;
            case "delete": this.removePlaylist([id]); break;
            case "rename": this.renamePlaylist(id); break;
            case "copy": break;
            case "remove": this.removePlaylistItems([id]); break;
        }
    }

    //#endregion

    private getToolbarConfig = (): ToolbarItem[] => {
        const disabled = this.selection.none();
        return this.props.id === "PL:" ?
            [
                ["create", "Create", "plus", this.addClickHandler, undefined],
                ["delete", "Delete", "trash", this.removeClickHandler, disabled],
                ["rename", "Rename", "edit", this.renameClickHandler, !this.selection.one()],
                ["copy", "Copy", "copy", this.copyClickHandler, disabled]
            ] :
            [
                ["add-items", "Add items", "plus", this.addItemsClickHandler, undefined],
                ["add-url", "Add stream url", "broadcast-tower", this.addUrlClickHandler, undefined],
                ["add-files", "Add from playlist file", "list", this.uploadPlaylistClickHandler, undefined],
                ["remove", "Remove items", "trash", this.removeItemsClickHandler, disabled]
            ];
    }

    private getMenuConfig = (): MenuItem[] => this.props.id === "PL:" ?
        [
            ["add-items", "Add items", "plus", undefined],
            ["add-url", "Add stream url", "broadcast-tower", undefined],
            ["add-files", "Add playlist file", "list", undefined],
            ["divider", undefined, undefined, undefined],
            ["rename", "Rename", "edit", undefined],
            ["delete", "Delete", "trash", undefined],
            ["copy", "Copy", "copy", true]
        ] :
        [
            ["remove", "Remove item", "trash", undefined],
            ["divider", undefined, undefined, undefined],
            ["play", "Play", "play", true],
        ];


    render() {

        const { dataContext: data, match, navigate, id, s, p, fetching, error } = this.props;
        const { source: { total = 0, items = [], parents = [] } = {} } = data || {};
        const { state, playlist, currentTrack } = this.state;
        const size = s ? parseInt(s) : $config.pageSize;
        const page = p ? parseInt(p) : 1;
        const fetched = items.length;
        const activeIndex = id === "PL:"
            ? playlist === "aux" ? items.findIndex(i => i.vendor?.["mi:playlistType"] === "aux") : items.findIndex(i => i.res?.url === playlist)
            : currentTrack && playlist === parents[0]?.res?.url ? parseInt(currentTrack) - size * (page - 1) - 1 : -1;

        const cellContext: CellContext = {
            play: this.play,
            pause: this.pause,
            playUrl: this.playUrl,
            state
        };

        const getRowState = (item: DIDLItem, index: number) => RowState.None
            | (index === activeIndex ? RowState.Active : RowState.None)
            | (isReadonly(item) ? RowState.Readonly : RowState.Selectable)
            | (isNavigable(item) ? RowState.Navigable : RowState.None);

        return <DropTarget className="d-flex flex-column h-100" acceptedTypes={fileTypes} onDrop={this.onDropFiles}>
            <PlaylistSvgSymbols />
            {fetching && <LoadIndicatorOverlay />}
            <SignalRListener handlers={this.handlers}>
                <Browser dataContext={data} fetching={fetching} error={error} mainCellTemplate={MainCell} mainCellContext={cellContext}
                    selection={this.selection} navigate={navigate} open={this.open} rowState={getRowState}
                    useCheckboxes selectOnClick multiSelect>
                    <Browser.Header className="p-0">
                        <div className="d-flex flex-column">
                            <Toolbar className="px-2 py-1 bg-light border-bottom">
                                <Toolbar.Group>
                                    {this.getToolbarConfig().map(i => <Toolbar.Button key={i[0]} title={i[1]} glyph={i[2]} onClick={i[3]} disabled={i[4]} className="btn-round" />)}
                                </Toolbar.Group>
                            </Toolbar>
                            <Breadcrumb items={parents} path={match.path} params={match.params} />
                        </div>
                    </Browser.Header>
                    <Browser.ContextMenu placement="bottom-end" onSelect={this.menuSelectHandler}>
                        {this.getMenuConfig().map(i => <li key={i[0]}>
                            {i[1] || i[2]
                                ? <button data-action={i[0]} disabled={i[3]} className="dropdown-item">
                                    {i[2] && <svg><use href={`#${i[2]}`}></use></svg>}{i[1]}
                                </button>
                                : <hr className="dropdown-divider mx-2"></hr>}
                        </li>)}
                    </Browser.ContextMenu>
                </Browser>
            </SignalRListener>
            <div className="sticky-bottom">
                <div className="bg-light text-center text-muted small p-1 border-top">{
                    this.selection.length > 0
                        ? `${this.selection.length} of ${fetched} selected`
                        : `${fetched} item${fetched !== 1 ? "s" : ""}`}
                    , {total} totally available
                    </div>
                {total !== 0 && fetched !== total &&
                    <Pagination baseUrl={match.url} className="border-top" total={total} current={page} pageSize={size} />}
            </div>
            {this.state.modal}
        </DropTarget >;
    }
}

const browsePlaylistsQueryBuilder = fromBaseQuery((device, id) => $api.browse(device).get(id || "PL:").withParents().withResource().withVendor());

export default withBrowser(PlaylistManagerCore, false, browsePlaylistsQueryBuilder);