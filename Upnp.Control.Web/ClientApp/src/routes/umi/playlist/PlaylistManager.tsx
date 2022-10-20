import { ComponentProps, ComponentType, createRef, HTMLAttributes, PureComponent, ReactElement, UIEventHandler, useCallback, useMemo } from "react";
import { DataFetchProps } from "../../../components/DataFetch";
import { DialogProps } from "../../../components/Dialog";
import PromptDialog from "../../../components/Dialog.Prompt";
import DialogHost from "../../../components/DialogHost";
import { DropdownMenu, MenuItem } from "../../../components/DropdownMenu";
import { DropTarget } from "../../../components/DropTarget";
import { PressHoldGestureRecognizer } from "../../../components/gestures/PressHoldGestureRecognizer";
import { HotKey, HotKeys } from "../../../components/HotKey";
import { LoadIndicatorOverlay } from "../../../components/LoadIndicator";
import { MediaQueries } from "../../../components/MediaQueries";
import $api from "../../../components/WebApi";
import { BottomBar } from "../../common/BottomBar";
import Breadcrumb from "../../common/Breadcrumb";
import { useContentBrowser } from "../../common/BrowserUtils";
import BrowserView, { CellTemplateProps } from "../../common/BrowserView";
import { isMusicTrack } from "../../common/DIDLTools";
import ItemInfoDialog from "../../common/ItemInfoDialog";
import Pagination from "../../common/Pagination";
import { PlaybackStateProvider, usePlaybackState } from "../../common/PlaybackStateContext";
import { PlaybackStateNotifier } from "../../common/PlaybackStateNotifier";
import RowStateContext, { RowState } from "../../common/RowStateContext";
import $s from "../../common/Settings";
import MainCell from "./CellTemplate";
import AddItemsDialog from "./dialogs/AddItemsDialog";
import AddUrlDialog from "./dialogs/AddUrlDialog";
import RemoveItemsDialog from "./dialogs/RemoveItemsDialog";
import UploadPlaylistDialog from "./dialogs/UploadPlaylistDialog";
import { PlaylistItemActionMenu } from "./PlaylistItemActionMenu";
import { PlaylistManagerService } from "./PlaylistManagerService";
import { PlaylistManagerToolbar } from "./PlaylistManagerToolbar";
import { PlaylistMenuActionHandlers } from "./PlaylistMenuActionHandlers";
import { PlaylistRowStateProvider } from "./PlaylistRowStateProvider";

type PlaylistManagerProps = HTMLAttributes<HTMLDivElement> &
    Omit<UI.PlaylistRouteParams, "category">
    & DataFetchProps<Upnp.BrowseFetchResult>
    & { navigate(to: string): void }

type PlaylistManagerState = { editMode: boolean }

const dialogBrowserProps = { multiSelect: true, useCheckboxes: true }

function getBrowserDialogRowState(item: Upnp.DIDL.Item) {
    return item.container
        ? RowState.Navigable | RowState.Selectable
        : isMusicTrack(item)
            ? RowState.Selectable
            : RowState.None
}

function fetchPlaylistStateAsync(deviceId: string) {
    return $api.playlist(deviceId).state().json();
}

const fileTypes = ["audio/mpegurl", "audio/x-mpegurl"]

export class PlaylistManagerCore extends PureComponent<PlaylistManagerProps, PlaylistManagerState> {

    displayName = PlaylistManagerCore.name;
    dialogHostRef = createRef<DialogHost>();
    browserNodeRef = createRef<HTMLDivElement>();
    pressHoldGestureRecognizer: PressHoldGestureRecognizer<HTMLDivElement>;
    service: PlaylistManagerService;
    actionHandlers: PlaylistMenuActionHandlers;
    pls;

    static defaultProps = { id: "PL:" };

    constructor(props: PlaylistManagerProps) {
        super(props);
        this.state = { editMode: false };
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
            navigateBack: () => this.props.navigate(this.props.dataContext?.source.parents?.[1]?.id ?? "-1")
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

    private dialog(dialog: ReactElement<DialogProps>) {
        this.dialogHostRef.current?.show(dialog);
    }

    private createHandler(impl: (item: Upnp.DIDL.Item) => void): UIEventHandler<HTMLElement> {
        return ({ currentTarget: { dataset: { index } } }) => {
            if (!index) throw new Error("No 'data-index' attribute value available from the current HTML element");

            const item = this.props.dataContext?.source?.items?.[parseInt(index)];
            if (item) return impl(item);
        }
    }

    //#region API calls wrapped with UI indication and automatic data reload

    private reload = (action?: () => Promise<any>) => this.props.dataContext ? this.props.dataContext.reload(action) : Promise.resolve(null);

    private rename = (id: string, title: string) => this.reload(() => this.pls.rename(id, title).fetch($s.get("timeout")));

    private copy = (id: string, title: string) => this.reload(() => this.pls.copy(id, title).fetch($s.get("containerScanTimeout")));

    private create = (title: string) => this.reload(() => this.pls.create(title).fetch($s.get("timeout")));

    private delete = (ids: string[]) => this.reload(() => this.pls.delete(ids).fetch($s.get("timeout")));

    private addItems = (id: string, device: string, ids: string[]) => this.reload(() => this.pls
        .addItems(id, device, ids, $s.get("containerScanDepth"))
        .fetch($s.get("containerScanTimeout")));

    private addUrl = (id: string, url: string, title?: string, useProxy?: boolean) =>
        this.reload(() => this.pls.addUrl(id, url, title, useProxy).fetch($s.get("timeout")));

    private addFiles = (id: string, data: FormData) => this.reload(() => this.pls.addFromFiles(id, data).fetch($s.get("timeout")));

    private deleteItems = (ids: string[]) => this.reload(() => this.pls.removeItems(this.props.id, ids).fetch($s.get("timeout")));

    private showInfo = (id: string) => {
        var item = this.props.dataContext?.source.items?.find(i => i.id === id);
        if (!item) return;
        this.dialog(<ItemInfoDialog item={item} />);
    }

    //#endregion

    //#region Action UI handlers

    private createPlaylist = () => this.dialog(<PromptDialog caption="Create new playlist" confirmText="Create" defaultValue="New Playlist" onConfirmed={this.create} />);

    private deletePlaylists = (items: Upnp.DIDL.Item[]) => {
        const onRemove = () => this.delete(items.map(i => i.id));

        this.dialog(<RemoveItemsDialog title="Do you want to delete playlist(s)?" onRemove={onRemove}>
            <ul className="list-unstyled">
                {[items?.map(({ title }, index) => <li key={index}>{title}</li>)]}
            </ul>
        </RemoveItemsDialog>);
    }

    private renamePlaylist = (item: Upnp.DIDL.Item) => {
        const onRename = (value: string) => this.rename(item.id, value);
        this.dialog(<PromptDialog caption="Rename playlist" confirmText="Rename" defaultValue={item.title} onConfirmed={onRename} />);
    }

    private copyPlaylist = (item: Upnp.DIDL.Item) => {
        this.copy(item.id, `${item.title} - Copy`);
    }

    private deletePlaylistItems = (items: Upnp.DIDL.Item[]) => {
        const onRemove = () => this.deleteItems(items.map(i => i.id));

        this.dialog(<RemoveItemsDialog onRemove={onRemove}>
            <ul className="list-unstyled">{[items?.map(({ title }, index) => <li key={index}>{title}</li>)]}</ul>
        </RemoveItemsDialog>);
    }

    private addPlaylistItems = (id: string) => this.dialog(<AddItemsDialog browserProps={dialogBrowserProps}
        onConfirmed={({ device, keys }) => this.addItems(id, device, keys)}
        rowStateMapper={getBrowserDialogRowState} />);


    private addPlaylistUrl = (id: string) => {
        const addUrl = (url: string, title?: string, useProxy?: boolean) => this.addUrl(id, url, title, useProxy);
        return this.dialog(<AddUrlDialog useProxy={$s.get("useDlnaProxy")} onAdd={addUrl} />);
    }

    private addPlaylistFiles = (id: string) => {
        const addFiles = (data: FormData) => this.addFiles(id, data);
        return this.dialog(<UploadPlaylistDialog useProxy={$s.get("useDlnaProxy")} onAdd={addFiles} />);
    }

    //#endregion

    //#region Drag&Drop handler

    private dropFilesHandler = (files: Iterable<File>) => {
        const useProxy = $s.get("useDlnaProxy");
        const request = this.props.id === "PL:"
            ? this.pls.createFromFiles(files, null, false, useProxy)
            : this.pls.addFromFiles(this.props.id, files, useProxy);
        this.reload(() => request.fetch($s.get("timeout")));
        return true;
    }

    //#endregion

    hotKeyHandler = (selection: Upnp.DIDL.Item[], focused: Upnp.DIDL.Item | undefined, hotKey: HotKey) => {
        const rootLevel = this.props.id === "PL:";
        if (hotKey.equals(HotKeys.showInfo)) {
            this.dialogHostRef.current?.show(<ItemInfoDialog item={focused ?? selection[0]} />);
            return false;
        }
        if (hotKey.equals(HotKeys.delete)) {
            if (rootLevel)
                this.deletePlaylists(selection);
            else
                this.deletePlaylistItems(selection);
            return false;
        }
        if (hotKey.equals(HotKeys.createNew)) {
            if (rootLevel)
                this.createPlaylist();
            return false;
        }
        if (hotKey.equals(HotKeys.rename)) {
            if (rootLevel && focused)
                this.renamePlaylist(focused);
            return false;
        }
        if (hotKey.equals(HotKeys.duplicate)) {
            if (rootLevel && focused)
                this.copyPlaylist(focused);
            return false;
        }
    }

    renderItemActionMenu = (anchor?: HTMLElement | null) => {
        return anchor?.dataset.index
            ? <PlaylistItemActionMenu index={parseInt(anchor?.dataset.index)} root={this.props.id === "PL:"} getTrackUrlHook={this.getPlayUrl} handlers={this.actionHandlers} />
            : null;
    }

    renderActionMenu = () => {
        return <>
            <MenuItem action="add-items" glyph="symbols.svg#add" onClick={this.service.addItems}>From media server</MenuItem>
            <MenuItem action="add-url" glyph="symbols.svg#podcasts" onClick={this.service.addFeedUrl}>Internet stream url</MenuItem>
            <MenuItem action="add-files" glyph="symbols.svg#feed" onClick={this.service.addPlaylistFiles}>Upload playlist file</MenuItem>
        </>;
    }

    getActiveTrackIndex = (playlist: string | undefined | null, currentTrack: string | undefined | null): number => {
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
            {fetching && <LoadIndicatorOverlay />}
            <DropTarget className="browser-shell flex-fill overflow-hidden" acceptedTypes={fileTypes} onDropped={this.dropFilesHandler}>
                <PlaybackStateNotifier device={device} callback={this.playbackStateChanged} />
                <PlaybackStateProvider device={device} fetchVendorState={fetchPlaylistStateAsync}>
                    <PlaylistRowStateProvider items={data?.source.items} getActiveTrackIndexHook={data?.source.items && this.getActiveTrackIndex}>
                        <PlaylistManagerToolbar service={this.service} editMode={this.state.editMode} rootLevel={isRootLevel}
                            fetching={fetching} title={data?.source.parents?.[0]?.title} subtitle={data?.source?.device?.name} />
                        <Browser nodeRef={this.browserNodeRef} dataContext={data} fetching={fetching} error={error}
                            className={"flex-fill mb-1 br-area-main" + (largeScreen ? "" : " pb-5")}
                            device={device} deviceName={this.props.dataContext?.source.device?.name} getUrlHook={this.getPlayUrl}
                            navigate={navigate} hotKeyHandler={this.hotKeyHandler}
                            editMode={this.state.editMode} useCheckboxes={this.state.editMode || hasTouch && largeScreen}>
                            <DropdownMenu render={this.renderItemActionMenu} />
                        </Browser>
                        {!fetching && data?.source.items?.length === 0 &&
                            <div className="br-area-main text-muted d-flex align-items-center justify-content-center">
                                <svg className="icon icon-5x"><use href="symbols.svg#folder" /></svg>
                            </div>}
                        <div className="sticky-bottom br-area-bottom">
                            <RowStateContext.Consumer>
                                {({ selection: { length: selected } }) => <>
                                    {!largeScreen && !fetching &&
                                        <div className="position-relative d-flex justify-content-center justify-content-sm-end">
                                            <div className="float-container m-3">
                                                <button type="button" className="btn btn-round btn-primary"
                                                    onClick={isRootLevel && selected === 0 ? this.createPlaylist : undefined}
                                                    data-toggle={(selected > 0 || !isRootLevel) ? "dropdown" : undefined}>
                                                    <svg><use href="symbols.svg#add" /></svg>
                                                </button>
                                            </div>
                                            <DropdownMenu render={this.renderActionMenu} />
                                        </div>}
                                    <BottomBar>
                                        {selected > 0 ? <span className="text-muted me-auto small d-none d-sm-inline text-truncate">{`${selected} of ${fetched} selected`}</span> : null}
                                        <Pagination total={total} current={page} pageSize={pageSize} />
                                    </BottomBar>
                                </>}
                            </RowStateContext.Consumer>
                            {largeScreen && <Breadcrumb className="border-top" items={parents} />}
                        </div>
                    </PlaylistRowStateProvider>
                </PlaybackStateProvider>
                <DialogHost ref={this.dialogHostRef} />
            </DropTarget >
        </>
    }
}

type MainCellCtx = typeof MainCell extends ComponentType<CellTemplateProps<infer C>> ? C : unknown;

type PlaylistBrowserProps = ComponentProps<typeof BrowserView<MainCellCtx>> & {
    device: string,
    deviceName: string | undefined,
    getUrlHook(index: number): string | undefined
}

function Browser({ device, deviceName, getUrlHook, ...props }: PlaylistBrowserProps) {
    const { dispatch, state: { state } } = usePlaybackState();
    const context = useMemo<MainCellCtx>(() => ({
        play: () => dispatch({ type: "PLAY" }),
        pause: () => dispatch({ type: "PAUSE" }),
        playItem: ({ currentTarget: { dataset: { index } } }) => dispatch({ type: "PLAY_URL", url: getUrlHook(parseInt(index!)) ?? "" }),
        state, device, deviceName
    }), [getUrlHook, state, device, deviceName]);
    const openCallback = useCallback((_: any, index: number) => {
        const url = getUrlHook(index);
        if (url) dispatch({ type: "PLAY_URL", url })
    }, [getUrlHook]);

    return <BrowserView {...props} useLevelUpRow={false} mainCellTemplate={MainCell} mainCellContext={context} openHandler={openCallback} />
}

const options = { withParents: true, withResourceProps: true, withVendorProps: true };
const defaults = { id: PlaylistManagerCore.defaultProps.id };

export default function PlaylistManager() {
    const { params: { device, ...routeParams }, ...other } = useContentBrowser(options, defaults);
    return <PlaylistManagerCore {...routeParams} {...other} device={device as string} />
}