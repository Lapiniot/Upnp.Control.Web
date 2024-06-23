import { HTMLAttributes, PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { HotKeys } from "../../../services/HotKey";
import Toolbar from "../../../components/Toolbar";
import { RowStateAction, useRowStates } from "../../../components/RowStateContext";
import { PlaylistManagerService } from "./PlaylistManagerService";

type PlaylistManagetToolbarProps = {
    editMode: boolean,
    compact?: boolean,
    rootLevel: boolean,
    title?: string,
    subtitle?: string,
    fetching: boolean | undefined,
    service: PlaylistManagerService
};

const initial = {
    selection: [] as Upnp.DIDL.Item[],
    dispatch: (_: RowStateAction): void => { throw new Error("Unsupported in this state") }
}

export function PlaylistManagerToolbar({ className, editMode, compact, rootLevel: rootLevel, fetching, title, subtitle, service, ...other }:
    HTMLAttributes<HTMLDivElement> & PropsWithChildren<PlaylistManagetToolbarProps>) {

    const { selection, dispatch } = useRowStates();
    const ref = useRef(initial);
    useEffect(() => { ref.current = { selection, dispatch } });
    useEffect(() => {
        if (editMode && "CloseWatcher" in window) {
            const watcher = new CloseWatcher();
            watcher.addEventListener("close", () => service.toggleEditMode(), { once: true });
            return () => watcher.destroy();
        }
    }, [editMode, service]);
    const handlers = useMemo(() => ({
        create: service.create,
        deletePlaylists: () => service.deletePlaylists(ref.current.selection),
        rename: () => service.renamePlaylist(ref.current.selection[0]),
        copy: () => service.copyPlaylist(ref.current.selection[0]),
        addItems: service.addItems,
        addItemsFromUrl: service.addFeedUrl,
        addItemsFromFiles: service.addPlaylistFiles,
        deleteItems: () => service.deleteItems(ref.current.selection),
        navigateBack: service.navigateBack,
        toggleEditMode: () => { service.toggleEditMode(); ref.current.dispatch({ type: "SET_ALL", selected: false }) },
        selectAll: () => ref.current.dispatch({ type: "TOGGLE_ALL" })
    }), [service]);

    const selectedCount = selection.length;
    const hasNoSelection = selectedCount === 0;
    const onlySelected = selectedCount === 1;
    const expanded = compact !== true;

    return <Toolbar className={`bg-surface-cntr p-2${className ? ` ${className}` : ""}`} {...other}>
        {editMode ? <>
            <Toolbar.Button icon="symbols.svg#close" onClick={handlers.toggleEditMode} />
            <small className="flex-fill overflow-hidden text-center text-truncate place-self-center">
                {selectedCount > 0 ? `${selectedCount} item${selectedCount > 1 ? "s" : ""} selected` : ""}
            </small>
        </> : <>
            <Toolbar.Button icon="symbols.svg#arrow_back_ios_new" onClick={handlers.navigateBack} />
            <div className="flex-fill overflow-hidden text-center text-md-start">
                <h6 className="mb-0 text-truncate">{title ?? "\xa0"}</h6>
                <small className="text-truncate">{subtitle ?? "\xa0"}</small>
            </div>
        </>}
        {rootLevel && expanded && !editMode &&
            <Toolbar.Button icon="symbols.svg#playlist_add" title={`Add new (${HotKeys.createNew})`} onClick={handlers.create} disabled={fetching} />}
        {rootLevel && (editMode || expanded) && <>
            <Toolbar.Button icon="symbols.svg#delete" title={`Delete (${HotKeys.delete})`} onClick={handlers.deletePlaylists} disabled={hasNoSelection} />
            <Toolbar.Button icon="symbols.svg#drive_file_rename_outline" title={`Rename (${HotKeys.rename})`} onClick={handlers.rename} disabled={!onlySelected} />
            <Toolbar.Button icon="symbols.svg#content_copy" title={`Duplicate (${HotKeys.duplicate})`} onClick={handlers.copy} disabled={!onlySelected} />
        </>}
        {!rootLevel && expanded && !editMode && <>
            <Toolbar.Button icon="symbols.svg#add" onClick={handlers.addItems} title="Add from media server" disabled={fetching} />
            <Toolbar.Button icon="symbols.svg#podcasts" onClick={handlers.addItemsFromUrl} title="Add Internet stream url" disabled={fetching} />
            <Toolbar.Button icon="symbols.svg#feed" onClick={handlers.addItemsFromFiles} title="Add from playlist file" disabled={fetching} />
        </>}
        {!rootLevel && (editMode || expanded) &&
            <Toolbar.Button icon="symbols.svg#delete" title={`Delete (${HotKeys.delete})`} onClick={handlers.deleteItems} disabled={hasNoSelection} />}
        {editMode &&
            <Toolbar.Button icon="symbols.svg#checklist" onClick={handlers.selectAll} />}
        {!editMode && !expanded &&
            <Toolbar.Button icon="symbols.svg#edit" onClick={handlers.toggleEditMode} disabled={fetching} />}
    </Toolbar>
}