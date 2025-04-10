import { ComponentProps, ComponentPropsWithRef, ComponentType, createRef, HTMLAttributes, PureComponent, ReactElement, UIEventHandler, useCallback, useContext, useMemo } from "react";
import { BottomBar } from "../../../components/BottomBar";
import Breadcrumb from "../../../components/Breadcrumb";
import Dialog from "../../../components/Dialog";
import PromptDialog from "../../../components/Dialog.Prompt";
import { DialogHost, IDialogHost } from "../../../components/DialogHost";
import { DropTarget } from "../../../components/DropTarget";
import { Menu, MenuItem } from "../../../components/Menu";
import Progress from "../../../components/Progress";
import RowStateContext, { RowState } from "../../../components/RowStateContext";
import { DataFetchProps } from "../../../hooks/DataFetch";
import { useInfiniteScroll } from "../../../hooks/InfiniteScroll";
import { PressHoldGestureRecognizer } from "../../../services/gestures/PressHoldGestureRecognizer";
import { HotKey, HotKeys } from "../../../services/HotKey";
import { MediaQueries } from "../../../services/MediaQueries";
import $api from "../../../services/WebApi";
import { useContentBrowser } from "../../common/BrowserUtils";
import BrowserView, { CellTemplateProps } from "../../common/BrowserView";
import { isMusicTrack } from "../../common/DIDLTools";
import ItemInfoDialog from "../../common/ItemInfoDialog";
import { PlaybackStateContext, PlaybackStateProvider } from "../../common/PlaybackStateContext";
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
    dialogHostRef = createRef<IDialogHost>();
    browserNodeRef = createRef<HTMLDivElement>();
    pressHoldGestureRecognizer: PressHoldGestureRecognizer<HTMLElement>;
    service: PlaylistManagerService;
    actionHandlers: PlaylistMenuActionHandlers;
    pls;

    static defaultProps = { id: "PL:" };

    constructor(props: PlaylistManagerProps) {
        super(props);
        this.state = { editMode: false };
        this.pls = $api.playlist(this.props.device);
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
            navigateBack: () => this.props.navigate(`../${this.props.dataContext?.source.parents?.[1]?.id ?? "-1"}`)
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
        this.pressHoldGestureRecognizer = new PressHoldGestureRecognizer<HTMLElement>(this.service.toggleEditMode);
    }

    async componentDidUpdate(prevProps: PlaylistManagerProps) {
        if (prevProps.dataContext !== this.props.dataContext) {
            this.pls = $api.playlist(this.props.device);
        }
    }

    async componentDidMount() {
        MediaQueries.largeScreen.addEventListener("change", this.mediaQueryListChanged);
        MediaQueries.touchDevice.addEventListener("change", this.mediaQueryListChanged);
        if (this.browserNodeRef.current) {
            this.pressHoldGestureRecognizer.bind(this.browserNodeRef.current);
        }
    }

    componentWillUnmount() {
        this.pressHoldGestureRecognizer.unbind();
        MediaQueries.touchDevice.removeEventListener("change", this.mediaQueryListChanged);
        MediaQueries.largeScreen.removeEventListener("change", this.mediaQueryListChanged);
    }

    private mediaQueryListChanged = () => this.forceUpdate();

    private dialog(dialog: ReactElement<ComponentPropsWithRef<typeof Dialog>>) {
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

    private reload = (action?: () => Promise<unknown>) => this.props.dataContext ? this.props.dataContext.reload(action) : Promise.resolve(null);

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
        const item = this.props.dataContext?.source.items?.find(i => i.id === id);
        if (!item) return;
        this.dialog(<ItemInfoDialog item={item} />);
    }

    //#endregion

    //#region Action UI handlers

    private createPlaylist = () => this.dialog(<PromptDialog caption="Create new playlist" confirmText="Create"
        icon="symbols.svg#playlist_add" className="dialog-md" defaultValue="New Playlist" onConfirmed={this.create} />);

    private deletePlaylists = (items: Upnp.DIDL.Item[]) => {
        const onRemove = () => this.delete(items.map(i => i.id));

        this.dialog(<RemoveItemsDialog title="Do you want to delete playlist(s)?" onRemove={onRemove}>
            <ul className="list-unstyled m-0">
                {[items?.map(({ title }, index) => <li key={index}>{title}</li>)]}
            </ul>
        </RemoveItemsDialog>);
    }

    private renamePlaylist = (item: Upnp.DIDL.Item) => {
        const onRename = (value: string) => this.rename(item.id, value);
        this.dialog(<PromptDialog caption="Rename playlist" confirmText="Rename"
            icon="symbols.svg#drive_file_rename_outline" className="dialog-md"
            defaultValue={item.title} onConfirmed={onRename} />);
    }

    private copyPlaylist = (item: Upnp.DIDL.Item) => {
        this.copy(item.id, `${item.title} - Copy`);
    }

    private deletePlaylistItems = (items: Upnp.DIDL.Item[]) => {
        const onRemove = () => this.deleteItems(items.map(i => i.id));

        this.dialog(<RemoveItemsDialog onRemove={onRemove}>
            <ul className="list-unstyled m-0">{[items?.map(({ title }, index) => <li key={index}>{title}</li>)]}</ul>
        </RemoveItemsDialog>);
    }

    private addPlaylistItems = (id: string) => this.dialog(<AddItemsDialog browserProps={dialogBrowserProps}
        onConfirmed={({ device, keys }) => this.addItems(id, device, keys)}
        rowStateMapper={getBrowserDialogRowState} />);


    private addPlaylistUrl = (id: string) => {
        const addUrl = (url: string, title?: string, useProxy?: boolean) => this.addUrl(id, url, title, useProxy);
        return this.dialog(<AddUrlDialog className="dialog-md" useProxy={$s.get("useDlnaProxy")} onAdd={addUrl} />);
    }

    private addPlaylistFiles = (id: string) => {
        const addFiles = (data: FormData) => this.addFiles(id, data);
        return this.dialog(<UploadPlaylistDialog className="dialog-md" useProxy={$s.get("useDlnaProxy")} onAdd={addFiles} />);
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
            <MenuItem action="add-items" icon="symbols.svg#add" onClick={this.service.addItems}>From media server</MenuItem>
            <MenuItem action="add-url" icon="symbols.svg#podcasts" onClick={this.service.addFeedUrl}>Internet stream url</MenuItem>
            <MenuItem action="add-files" icon="symbols.svg#feed" onClick={this.service.addPlaylistFiles}>Upload playlist file</MenuItem>
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

    render() {

        const { dataContext: data, navigate, fetching, error, id, device } = this.props;
        const { source: { items = [], parents = [] } = {} } = data || {};

        const fetched = items.length;
        const isRootLevel = id === "PL:";

        const largeScreen = MediaQueries.largeScreen.matches;
        const hasTouch = MediaQueries.touchDevice.matches;

        return <DropTarget className="browser-shell flex-fill overflow-hidden" acceptedTypes={fileTypes} onDropped={this.dropFilesHandler}>
            <PlaybackStateProvider device={device} trackPosition fetchVendorState={fetchPlaylistStateAsync}>
                <PlaylistRowStateProvider items={data?.source.items} getActiveTrackIndexHook={data?.source.items && this.getActiveTrackIndex}>
                    <PlaylistManagerToolbar className="br-area-top" service={this.service} editMode={this.state.editMode} compact={!largeScreen} rootLevel={isRootLevel}
                        fetching={fetching} title={data?.source.parents?.[0]?.title} subtitle={data?.source.device?.name} />
                    <Browser inert={fetching} nodeRef={this.browserNodeRef} dataContext={data} fetching={fetching} error={error}
                        className="br-area-main flex-fill pb-6"
                        device={device} deviceName={this.props.dataContext?.source.device?.name} getUrlHook={this.getPlayUrl}
                        navigate={navigate} hotKeyHandler={this.hotKeyHandler}
                        editMode={this.state.editMode} useCheckboxes={this.state.editMode || hasTouch && largeScreen}
                        displayMode={largeScreen ? "table" : "list"} navigationMode={hasTouch ? "tap" : "dbl-click"}>
                        <Menu className="drop-left action-sheet-sm" render={this.renderItemActionMenu} />
                    </Browser>
                    {!fetching && data?.source.items?.length === 0 &&
                        <div className="br-area-main d-flex align-items-center justify-content-center">
                            <svg className="icon-5x"><use href="symbols.svg#folder" /></svg>
                        </div>}
                    {!fetching &&
                        <div className="br-area-main d-lg-none place-self-end-end place-self-md-end-center">
                            <button type="button" className="btn btn-fab btn-fab-lg btn-fab-low"
                                onClick={isRootLevel ? this.createPlaylist : undefined}
                                data-toggle={!isRootLevel ? "dropdown" : undefined}>
                                <svg><use href="symbols.svg#add" /></svg>
                            </button>
                            <Menu className="drop-top-center action-sheet-sm" id="main-menu" render={this.renderActionMenu} />
                        </div>}
                    <RowStateContext.Consumer>
                        {({ selection: { length: selected } }) =>
                            <BottomBar className="flex-wrap gx-3 border-top">
                                {largeScreen && <Breadcrumb className="me-auto" items={parents} />}
                                {selected > 0 ? <span className="small d-none d-sm-inline text-truncate">{`${selected} of ${fetched} selected`}</span> : null}
                            </BottomBar>}
                    </RowStateContext.Consumer>
                </PlaylistRowStateProvider>
            </PlaybackStateProvider>
            <DialogHost ref={this.dialogHostRef} />
        </DropTarget>
    }
}

type MainCellCtx = typeof MainCell extends ComponentType<CellTemplateProps<infer C>> ? C : unknown;

type PlaylistBrowserProps = ComponentProps<typeof BrowserView<MainCellCtx>> & {
    device: string,
    deviceName: string | undefined,
    getUrlHook(index: number): string | undefined
}

function Browser({ device, deviceName, getUrlHook, className, children, ...props }: PlaylistBrowserProps) {
    const { dispatch, state: { state } } = useContext(PlaybackStateContext);
    const { dataContext: data, fetching } = props;

    const context = useMemo<MainCellCtx>(() => ({
        play: () => dispatch({ type: "PLAY" }),
        pause: () => dispatch({ type: "PAUSE" }),
        playItem: ({ currentTarget: { dataset: { index } } }) => dispatch({ type: "PLAY_URL", url: getUrlHook(parseInt(index!)) ?? "" }),
        state, device, deviceName
    }), [getUrlHook, state, device, deviceName]); // eslint-disable-line

    const openCallback = useCallback((_: unknown, index: number) => {
        const url = getUrlHook(index);
        if (url) dispatch({ type: "PLAY_URL", url })
    }, [getUrlHook]); // eslint-disable-line


    const scrollTracker = useInfiniteScroll(data?.next, undefined, "0px 0px 150px 0px");

    const progress = (data?.source.items?.length ?? 0) / (data?.source.total ?? 1);

    return <>
        <BrowserView {...props} className={`mt-1${className ? ` ${className}` : ""}`} useLevelUpRow={false} mainCellTemplate={MainCell} mainCellContext={context} openHandler={openCallback}>
            {scrollTracker}
            {children}
        </BrowserView>
        <Progress className={`br-area-main place-self-start-stretch sticky-top m-0${progress === 1 ? " d-none" : ""}`}
            value={progress} infinite={fetching} />
    </>
}

const options = { withParents: true, withResourceProps: true, withVendorProps: true };
const defaults = { id: PlaylistManagerCore.defaultProps.id };

export default function PlaylistManager() {
    const { params: { device, ...routeParams }, ...other } = useContentBrowser(options, defaults);
    return <PlaylistManagerCore {...routeParams} {...other} device={device as string} />
}