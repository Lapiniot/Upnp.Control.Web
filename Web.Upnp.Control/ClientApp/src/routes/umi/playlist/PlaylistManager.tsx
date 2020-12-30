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
import Browser, { BrowserCoreProps } from "../../common/BrowserCore";
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
    filter: DIDLUtils.isMusicTrack,
    multiSelect: true,
    selectOnClick: true,
    useCheckboxes: true,
    runsInDialog: true
}

const fileTypes = ["audio/mpegurl", "audio/x-mpegurl"];

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

    static isEditable = (item: DIDLItem) => !item.readonly;

    resetModal = () => { this.setState({ modal: null }); }

    reload = () => { if (this.props.dataContext) this.props.dataContext.reload(); }

    renamePlaylist = (id: string, title: string) => $api.playlist(this.props.device).rename(id, title).fetch().then(this.reload);

    createPlaylist = (title: string) => $api.playlist(this.props.device).create(title).fetch().then(this.reload);

    removePlaylist = (ids: string[]) => $api.playlist(this.props.device).delete(ids).fetch().then(this.selection.reset).then(this.reload);

    addItems = (device: string, ids: string[]) => $api.playlist(this.props.device).addItems(this.props.id, device, ids).fetch().then(this.reload);

    addUrl = (url: string, title?: string, useProxy?: boolean) => $api.playlist(this.props.device).addUrl(this.props.id, url, title, useProxy).fetch().then(this.reload);

    addPlaylists = (data: FormData) => $api.playlist(this.props.device).addFromFiles(this.props.id, data).fetch().then(this.reload);

    removeItems = (ids: string[]) => $api.playlist(this.props.device).removeItems(this.props.id, ids).fetch().then(this.selection.reset).then(this.reload);

    onAdd = () => {
        this.setState({
            modal: <TextValueEditDialog id="create-dialog" title="Create new playlist" label="Name" confirmText="Create"
                defaultValue="New Playlist" onConfirm={this.createPlaylist} onDismiss={this.resetModal} immediate />
        });
    }

    onRemove = () => {

        const ids = [...this.selection.keys];
        const values = this.props.dataContext?.source.items.filter(e => ids.includes(e.id));
        const onRemove = () => this.removePlaylist(ids);

        this.setState({
            modal: <RemoveItemsModalDialog id="remove-dialog" title="Do you want to delete playlist(s)?" onDismiss={this.resetModal} onRemove={onRemove}>
                <ul className="list-unstyled">
                    {[values?.map(e => <li key={e.id}>{e.title}</li>)]}
                </ul>
            </RemoveItemsModalDialog>
        });
    }

    onRename = () => {
        const id = this.selection.keys.next().value;
        const title = this.props.dataContext?.source.items.find(e => e.id === id)?.title;
        const onRename = (value: string) => this.renamePlaylist(id, value);

        this.setState({
            modal: <TextValueEditDialog id="rename-confirm" title="Rename playlist" label="Name" confirmText="Rename"
                defaultValue={title} onConfirm={onRename} onDismiss={this.resetModal} immediate />
        });
    }

    onAddItems = () => this.setState({ modal: <AddItemsModalDialog id="add-items-dialog" onDismiss={this.resetModal} onAdd={this.addItems} browserProps={browserProps} /> });

    onAddUrl = () => this.setState({ modal: <AddUrlModalDialog id="add-url-dialog" onDismiss={this.resetModal} onAdd={this.addUrl} /> });

    onUploadPlaylist = () => this.setState({ modal: <UploadPlaylistModalDialog id="upload-playlist-dialog" onDismiss={this.resetModal} onAdd={this.addPlaylists} /> });

    onRemoveItems = () => {
        const ids = [...this.selection.keys];
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

    onDropFiles = (files: Iterable<File>, element: HTMLElement) => {
        $api.playlist(this.props.device).createFromFiles(files, null, false, true).fetch().then(this.reload);
        return true;
    }

    onCopy = () => { alert("not implemented yet"); };

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

    render() {

        const { dataContext: data, match, navigate, id, s, p, fetching, error } = this.props;
        const { source: { total = 0, items = [], parents = [] } = {} } = data || {};
        const { state, playlist, currentTrack } = this.state;
        const size = s ? parseInt(s) : $config.pageSize;
        const page = p ? parseInt(p) : 1;
        const fetched = items.length;
        const disabled = this.selection.none();
        const activeIndex = id === "PL:"
            ? playlist === "aux" ? items.findIndex(i => i.vendor?.["mi:playlistType"] === "aux") : items.findIndex(i => i.res?.url === playlist)
            : currentTrack && playlist === parents[0]?.res?.url ? parseInt(currentTrack) - size * (page - 1) - 1 : -1;

        const cellContext: CellContext = {
            play: this.play,
            pause: this.pause,
            playUrl: this.playUrl,
            state,
            parents,
            activeIndex
        };

        const toolbar = id === "PL:" ?
            [
                { key: "pl-create", title: "Create", glyph: "plus", onClick: this.onAdd },
                { key: "pl-delete", title: "Delete", glyph: "trash", onClick: this.onRemove, disabled: disabled },
                { key: "pl-rename", title: "Rename", glyph: "edit", onClick: this.onRename, disabled: !this.selection.one() },
                { key: "pl-copy", title: "Copy", glyph: "copy", onClick: this.onCopy, disabled: disabled }
            ] :
            [
                { key: "item-add", title: "Add items", glyph: "plus", onClick: this.onAddItems },
                { key: "url-add", title: "Add stream url", glyph: "broadcast-tower", onClick: this.onAddUrl },
                { key: "playlist-file-add", title: "Add from playlist file", glyph: "list", onClick: this.onUploadPlaylist },
                { key: "item-remove", title: "Remove items", glyph: "trash", onClick: this.onRemoveItems, disabled: disabled }
            ];

        return <DropTarget className="d-flex flex-column h-100" acceptedTypes={fileTypes} onDrop={this.onDropFiles}>
            {fetching && <LoadIndicatorOverlay />}
            <div className="flex-grow-1">
                <SignalRListener handlers={this.handlers}>
                    <Browser dataContext={data} fetching={fetching} error={error} cellTemplate={MainCell} cellContext={cellContext}
                        filter={PlaylistManagerCore.isEditable} navigate={navigate} selection={this.selection} open={this.open}
                        useCheckboxes selectOnClick>
                        <Browser.Header className="p-0">
                            <div className="d-flex flex-column">
                                <Toolbar className="px-2 py-1 bg-light border-bottom">
                                    <Toolbar.Group>
                                        {toolbar.map(i => <Toolbar.Button {...i} />)}
                                    </Toolbar.Group>
                                </Toolbar>
                                <Breadcrumb items={parents} path={match.path} params={match.params} />
                            </div>
                        </Browser.Header>
                    </Browser>
                </SignalRListener>
            </div>
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
        </DropTarget>;
    }
}

const browsePlaylistsQueryBuilder = fromBaseQuery((device, id) => $api.browse(device).get(id || "PL:").withParents().withResource().withVendor());

export default withBrowser(PlaylistManagerCore, false, browsePlaylistsQueryBuilder);