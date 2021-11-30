import React, { HTMLAttributes, ReactElement, UIEventHandler } from "react";
import { DataFetchProps } from "../../../components/DataFetch";
import { TextValueEditDialog } from "../../../components/Dialogs";
import { DropdownMenu, MenuItem } from "../../../components/DropdownMenu";
import { DropTarget } from "../../../components/DropTarget";
import { PressHoldGestureRecognizer } from "../../../components/gestures/PressHoldGestureRecognizer";
import { LoadIndicatorOverlay } from "../../../components/LoadIndicator";
import { MediaQueries } from "../../../components/MediaQueries";
import { ModalProps } from "../../../components/Modal";
import ModalHost from "../../../components/ModalHost";
import $api from "../../../components/WebApi";
import { BottomBar } from "../../common/BottomBar";
import Breadcrumb from "../../common/Breadcrumb";
import { useContentBrowser } from "../../common/BrowserUtils";
import Browser, { BrowserProps, HotKey } from "../../common/BrowserView";
import { DIDLTools } from "../../common/DIDLTools";
import ItemInfoModal from "../../common/ItemInfoModal";
import { NavigatorProps } from "../../../components/Navigator";
import { TablePagination } from "../../common/Pagination";
import { PlaybackStateNotifier } from "../../common/PlaybackStateNotifier";
import RowStateContext from "../../common/RowStateContext";
import $s from "../../common/Settings";
import { BrowserSvgSymbols, EditSvgSymbols, PlayerSvgSymbols, PlaylistSvgSymbols, PlaySvgSymbols } from "../../common/SvgSymbols";
import { BrowseFetchResult, DIDLItem, PlaylistRouteParams, RowState } from "../../common/Types";
import MainCell from "./CellTemplate";
import { AddItemsModal } from "./dialogs/AddItemsModal";
import { AddUrlModal } from "./dialogs/AddUrlModal";
import { RemoveItemsModal } from "./dialogs/RemoveItemsModal";
import { UploadPlaylistModal } from "./dialogs/UploadPlaylistModal";
import { PlaybackStateContext, PlaybackStateProvider } from "./PlaybackStateContext";
import { PlaylistItemActionMenu } from "./PlaylistItemActionMenu";
import { PlaylistManagerService } from "./PlaylistManagerService";
import { PlaylistManagerToolbar } from "./PlaylistManagerToolbar";
import { PlaylistMenuActionHandlers } from "./PlaylistMenuActionHandlers";
import { PlaylistRowStateProvider } from "./PlaylistRowStateProvider";

type PlaylistManagerProps = Omit<PlaylistRouteParams, "category"> &
    DataFetchProps<BrowseFetchResult> &
    HTMLAttributes<HTMLDivElement> &
    NavigatorProps;

type PlaylistManagerState = {
    editMode: boolean;
};

const dialogBrowserProps: BrowserProps<unknown> = {
    multiSelect: true,
    useCheckboxes: true
}

function getBrowserDialogRowState(item: DIDLItem) {
    return item.container
        ? RowState.Navigable | RowState.Selectable
        : DIDLTools.isMusicTrack(item)
            ? RowState.Selectable
            : RowState.None
}

const fileTypes = ["audio/mpegurl", "audio/x-mpegurl"];

export class PlaylistManagerCore
    extends React.Component<PlaylistManagerProps, PlaylistManagerState> {

    displayName = PlaylistManagerCore.name;
    modalHostRef = React.createRef<ModalHost>();
    browserNodeRef = React.createRef<HTMLDivElement>();
    pressHoldGestureRecognizer: PressHoldGestureRecognizer<HTMLDivElement>;
    service: PlaylistManagerService;
    actionHandlers: PlaylistMenuActionHandlers;
    ctrl;
    pls;

    static defaultProps = { id: "PL:" };

    constructor(props: PlaylistManagerProps) {
        super(props);
        this.state = { editMode: false };
        this.ctrl = $api.control(this.props.device);
        this.pls = $api.playlist(this.props.device);
        MediaQueries.largeScreen.addEventListener("change", this.queryChangedHandler);
        this.service = {
            create: this.createPlaylist,
            deletePlaylists: this.deletePlaylists,
            renamePlaylist: this.renamePlaylist,
            copyPlaylist: this.copyPlaylist,
            addItems: () => this.addPlaylistItems(this.props.id),
            addFeedUrl: () => this.addPlaylistUrl(this.props.id),
            addPlaylistFiles: () => this.addPlaylistFiles(this.props.id),
            deleteItems: this.deletePlaylistItems,
            toggleEditMode: () => this.setState(({ editMode }) => ({ editMode: !editMode })),
            navigateBack: () => this.props.navigate?.(`../${this.props.dataContext?.source.parents?.[1]?.id ?? "-1"}`)
        };
        this.actionHandlers = {
            addItems: this.createHandler(i => this.addPlaylistItems(i.id)),
            addUrl: this.createHandler(i => this.addPlaylistUrl(i.id)),
            addFiles: this.createHandler(i => this.addPlaylistFiles(i.id)),
            deleteItems: this.createHandler(i => this.deleteItems([i.id])),
            delete: this.createHandler(i => this.deletePlaylists([i])),
            rename: this.createHandler(i => this.renamePlaylist(i)),
            copy: this.createHandler(i => this.copyPlaylist(i)),
            showInfo: this.createHandler(i => this.showInfo(i.id))
        };
        this.pressHoldGestureRecognizer = new PressHoldGestureRecognizer<HTMLDivElement>(this.service.toggleEditMode);
    }

    async componentDidUpdate(prevProps: PlaylistManagerProps) {
        if (prevProps.dataContext !== this.props.dataContext) {
            this.ctrl = $api.control(this.props.device);
            this.pls = $api.playlist(this.props.device);
        }
    }

    async componentDidMount() {
        if (this.browserNodeRef.current) {
            this.pressHoldGestureRecognizer.bind(this.browserNodeRef.current);
        }
    }

    componentWillUnmount() {
        this.pressHoldGestureRecognizer.unbind();
        MediaQueries.largeScreen.removeEventListener("change", this.queryChangedHandler);
    }

    private queryChangedHandler = () => this.forceUpdate();

    private modal(modal: ReactElement<ModalProps>) {
        this.modalHostRef.current?.show(modal);
    }

    private createHandler(impl: (item: DIDLItem) => void): UIEventHandler<HTMLElement> {
        return ({ currentTarget: { dataset: { index } } }) => {
            if (!index) throw new Error("No 'data-index' attribute value available from the current HTML element");

            const item = this.props.dataContext?.source?.items?.[parseInt(index)];
            if (item) return impl(item);
        }
    }

    //#region API calls wrapped with UI indication and automatic data reload

    private reload = (action?: () => Promise<any>) => this.props.dataContext ? this.props.dataContext.reload(action) : Promise.resolve(null);

    private rename = (id: string, title: string) => this.reload($api.playlist(this.props.device).rename(id, title).fetch);

    private copy = (id: string, title: string) => this.reload($api.playlist(this.props.device).copy(id, title).fetch);

    private create = (title: string) => this.reload($api.playlist(this.props.device).create(title).fetch);

    private delete = (ids: string[]) => this.reload(() => $api.playlist(this.props.device).delete(ids).fetch());

    private addItems = (id: string, device: string, ids: string[]) => this.reload(() => $api
        .playlist(this.props.device)
        .addItems(id, device, ids, $s.get("containerScanDepth"))
        .fetch($s.get("containerScanTimeout")));

    private addUrl = (id: string, url: string, title?: string, useProxy?: boolean) => this.reload($api.playlist(this.props.device).addUrl(id, url, title, useProxy).fetch);

    private addFiles = (id: string, data: FormData) => this.reload($api.playlist(this.props.device).addFromFiles(id, data).fetch);

    private deleteItems = (ids: string[]) => this.reload(() => $api.playlist(this.props.device).removeItems(this.props.id, ids).fetch());

    private showInfo = (id: string) => {
        var item = this.props.dataContext?.source.items?.find(i => i.id === id);
        if (!item) return;
        this.modal(<ItemInfoModal item={item} />);
    }

    //#endregion

    //#region Action UI handlers

    private createPlaylist = () => this.modal(<TextValueEditDialog title="Create new playlist" label="Name" confirmText="Create" defaultValue="New Playlist" onConfirmed={this.create} />);

    private deletePlaylists = (items: DIDLItem[]) => {
        const onRemove = () => this.delete(items.map(i => i.id));

        this.modal(<RemoveItemsModal title="Do you want to delete playlist(s)?" onRemove={onRemove}>
            <ul className="list-unstyled">
                {[items?.map(e => <li key={e.id}>{e.title}</li>)]}
            </ul>
        </RemoveItemsModal>);
    }

    private renamePlaylist = (item: DIDLItem) => {
        const onRename = (value: string) => this.rename(item.id, value);
        this.modal(<TextValueEditDialog title="Rename playlist" label="Name" confirmText="Rename" defaultValue={item.title} onConfirmed={onRename} />);
    }

    private copyPlaylist = (item: DIDLItem) => {
        this.copy(item.id, `${item.title} - Copy`);
    }

    private deletePlaylistItems = (items: DIDLItem[]) => {
        const onRemove = () => this.deleteItems(items.map(i => i.id));

        this.modal(<RemoveItemsModal onRemove={onRemove}>
            <ul className="list-unstyled">{[items?.map(e => <li key={e.id}>{e.title}</li>)]}</ul>
        </RemoveItemsModal>);
    }

    private addPlaylistItems = (id: string) => this.modal(<AddItemsModal browserProps={dialogBrowserProps}
        onConfirmed={({ device, keys }) => this.addItems(id, device, keys)}
        rowStateMapper={getBrowserDialogRowState} />);


    private addPlaylistUrl = (id: string) => {
        const addUrl = (url: string, title?: string, useProxy?: boolean) => this.addUrl(id, url, title, useProxy);
        return this.modal(<AddUrlModal useProxy={$s.get("useDlnaProxy")} onAdd={addUrl} />);
    }

    private addPlaylistFiles = (id: string) => {
        const addFiles = (data: FormData) => this.addFiles(id, data);
        return this.modal(<UploadPlaylistModal useProxy={$s.get("useDlnaProxy")} onAdd={addFiles} />);
    }

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

    private playItem = (_: DIDLItem, index: number) => {
        const url = this.getPlayUrl(index);
        if (url) this.ctrl.playUri(url).fetch();
        return false;
    }

    //#endregion

    hotKeyHandler = (selection: DIDLItem[], focused: DIDLItem | undefined, { code }: HotKey) => {
        switch (code) {
            case "Space":
                this.modalHostRef.current?.show(<ItemInfoModal item={focused ?? selection[0]} />);
                return false;
            case "Delete":
                if (this.props.id === "PL:")
                    this.deletePlaylists(selection);
                else
                    this.deletePlaylistItems(selection);
                return false;
            default:
                break;
        }
    }

    renderItemActionMenu = (anchor?: HTMLElement | null) => {
        return anchor?.dataset.index
            ? <PlaylistItemActionMenu index={parseInt(anchor?.dataset.index)} root={this.props.id === "PL:"} handlers={this.actionHandlers} />
            : null;
    }

    renderActionMenu = () => {
        return <>
            <MenuItem action="add-items" key="add-items" glyph="plus" onClick={this.service.addItems}>From media server</MenuItem>
            <MenuItem action="add-url" key="add-url" glyph="broadcast-tower" onClick={this.service.addFeedUrl}>Internet stream url</MenuItem>
            <MenuItem action="add-files" key="add-files" glyph="list" onClick={this.service.addPlaylistFiles}>Upload playlist file</MenuItem>
        </>;
    }

    getActiveTrackIndex = (playlist: string | undefined, currentTrack: string | undefined): number => {
        const items = this.props.dataContext?.source?.items;
        const parents = this.props.dataContext?.source?.parents;
        const { p, s } = this.props;
        return this.props.id === "PL:"
            ? (playlist === "aux"
                ? (items?.findIndex(i => i.vendor?.["mi:playlistType"] === "aux") ?? -1)
                : (items?.findIndex(i => i.res?.url === playlist)) ?? -1)
            : (currentTrack && playlist === parents?.[0]?.res?.url
                ? parseInt(currentTrack) - (s ? parseInt(s) : $s.get("pageSize")) * ((p ? parseInt(p) : 1) - 1) - 1
                : -1);
    }

    private getPlayUrl = (index: number) => {
        const { dataContext, s, p } = this.props;
        const { items = [], parents = [] } = dataContext?.source ?? {};
        const item = items[index];
        if (!item || !item.res) return;

        return item.container
            ? `${item.res.url}#play`
            : `${parents[0]?.res?.url}#tracknr=${(p ? parseInt(p) - 1 : 0) * (s ? parseInt(s) : $s.get("pageSize")) + index + 1},play`;
    }

    private playbackStateChanged = () => {
        return $s.get("showPlaybackNotifications");
    }

    render() {

        const { dataContext: data, navigate, fetching, error, id, s, p, device } = this.props;
        const { source: { total = 0, items = [], parents = [] } = {} } = data || {};
        const pageSize = s ? parseInt(s) : $s.get("pageSize");
        const page = p ? parseInt(p) : 1;

        const fetched = items.length;
        const isRootLevel = id === "PL:";

        const largeScreen = MediaQueries.largeScreen.matches;
        const hasTouch = MediaQueries.touchDevice.matches;

        return <>
            <EditSvgSymbols />
            <PlaySvgSymbols />
            <PlaylistSvgSymbols />
            <PlayerSvgSymbols />
            <BrowserSvgSymbols />
            {fetching && <LoadIndicatorOverlay />}
            <DropTarget className="vstack overflow-hidden" acceptedTypes={fileTypes} onDropped={this.dropFilesHandler}>
                <PlaybackStateNotifier device={device} callback={this.playbackStateChanged} />
                <PlaybackStateProvider device={device} getTrackUrlHook={this.getPlayUrl} >
                    <PlaylistRowStateProvider items={data?.source.items} getActiveTrackIndexHook={data?.source.items && this.getActiveTrackIndex}>
                        <PlaylistManagerToolbar service={this.service} editMode={this.state.editMode} rootLevel={isRootLevel}
                            fetching={fetching} title={data?.source.parents?.[0]?.title} subtitle={data?.source?.dev?.name} />
                        <PlaybackStateContext.Consumer>{psv =>
                            <Browser nodeRef={this.browserNodeRef} dataContext={data} fetching={fetching} error={error}
                                className={"flex-fill mb-1" + (largeScreen ? "" : " pb-5")}
                                mainCellTemplate={MainCell} mainCellContext={{
                                    ...psv.handlers,
                                    state: psv.state,
                                    device: device,
                                    deviceName: this.props.dataContext?.source.dev?.name
                                }} navigate={navigate} openHandler={this.playItem} hotKeyHandler={this.hotKeyHandler}
                                editMode={this.state.editMode} useLevelUpRow={false} useCheckboxes={this.state.editMode || hasTouch && largeScreen}>
                                <DropdownMenu render={this.renderItemActionMenu} />
                            </Browser>}
                        </PlaybackStateContext.Consumer>
                        <div className="sticky-bottom">
                            <RowStateContext.Consumer>
                                {({ selection: { length: selected } }) => <>
                                    {!largeScreen && !fetching &&
                                        <div className="position-relative d-flex justify-content-center justify-content-sm-end">
                                            <div className="float-container position-absolute bottom-0">
                                                <button type="button" className="btn btn-round btn-primary"
                                                    onClick={isRootLevel && selected === 0 ? this.createPlaylist : undefined}
                                                    data-bs-toggle={(selected > 0 || !isRootLevel) ? "dropdown" : undefined}>
                                                    <svg className="icon"><use href="#plus" /></svg>
                                                </button>
                                            </div>
                                            <DropdownMenu render={this.renderActionMenu} />
                                        </div>}
                                    <BottomBar>
                                        {selected > 0 ? <span className="text-muted me-auto small d-none d-sm-inline text-truncate">{`${selected} of ${fetched} selected`}</span> : null}
                                        <TablePagination total={total} current={page} pageSize={pageSize} />
                                    </BottomBar>
                                </>}
                            </RowStateContext.Consumer>
                            {largeScreen && <Breadcrumb className="border-top" items={parents} />}
                        </div>
                    </PlaylistRowStateProvider>
                </PlaybackStateProvider>
                <ModalHost ref={this.modalHostRef} />
            </DropTarget >
        </>;
    }
}

const options = { withParents: true, withResourceProps: true, withVendorProps: true };
const defaults = { id: PlaylistManagerCore.defaultProps.id };

export default function PlaylistManager() {
    const { params: { device, ...routeParams }, ...other } = useContentBrowser(options, defaults);
    return <PlaylistManagerCore {...routeParams} {...other} device={device as string} />
}