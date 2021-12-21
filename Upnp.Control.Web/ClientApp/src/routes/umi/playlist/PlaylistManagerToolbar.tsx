import { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { HotKeys } from "../../../components/HotKey";
import { MediaQueries } from "../../../components/MediaQueries";
import Toolbar from "../../../components/Toolbar";
import { RowStateAction, useRowStates } from "../../common/RowStateContext";
import { DIDLItem } from "../../common/Types";
import { PlaylistManagerService } from "./PlaylistManagerService";

type PlaylistManagetToolbarProps = {
    editMode: boolean,
    rootLevel: boolean,
    title?: string,
    subtitle?: string,
    fetching: boolean | undefined,
    service: PlaylistManagerService
};

const className = "btn-round btn-icon btn-plain flex-grow-0";

const initial = {
    selection: [] as DIDLItem[],
    dispatch: (_value: RowStateAction): void => { throw new Error("Unsupported in this state") }
}

export function PlaylistManagerToolbar({ editMode, rootLevel: rootLevel, fetching, title, subtitle, service }:
    PropsWithChildren<PlaylistManagetToolbarProps>) {

    const { selection, dispatch } = useRowStates();
    const ref = useRef(initial);
    useEffect(() => { ref.current = { selection, dispatch } });
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
    const largeScreen = MediaQueries.largeScreen.matches;

    return <Toolbar className="px-2 py-1 bg-white border-bottom flex-nowrap">
        {editMode ? <>
            <Toolbar.Button glyph="close" onClick={handlers.toggleEditMode} className={className} />
            <small className="flex-fill my-0 mx-2 text-center text-truncate">
                {selectedCount > 0 ? `${selectedCount} item${selectedCount > 1 ? "s" : ""} selected` : ""}
            </small>
        </> : <>
            <Toolbar.Button glyph="chevron-left" onClick={handlers.navigateBack} className={className} />
            <div className="vstack align-items-stretch overflow-hidden text-center text-md-start mx-2">
                <h6 className="mb-0 text-truncate">{title ?? "\xa0"}</h6>
                <small className="text-muted text-truncate">{subtitle ?? "\xa0"}</small>
            </div>
        </>}
        {rootLevel && largeScreen && !editMode &&
            <Toolbar.Button glyph="plus" title={`Add new (${HotKeys.createNew})`} onClick={handlers.create} className={className} disabled={fetching} />}
        {rootLevel && (editMode || largeScreen) && <>
            <Toolbar.Button glyph="trash" title={`Delete (${HotKeys.delete})`} onClick={handlers.deletePlaylists} className={className} disabled={hasNoSelection} />
            <Toolbar.Button glyph="edit" title={`Rename (${HotKeys.rename})`} onClick={handlers.rename} className={className} disabled={!onlySelected} />
            <Toolbar.Button glyph="copy" title={`Duplicate (${HotKeys.duplicate})`} onClick={handlers.copy} className={className} disabled={!onlySelected} />
        </>}
        {!rootLevel && largeScreen && !editMode && <>
            <Toolbar.Button glyph="plus" onClick={handlers.addItems} title="Add from media server" className={className} disabled={fetching} />
            <Toolbar.Button glyph="broadcast-tower" onClick={handlers.addItemsFromUrl} title="Add Internet stream url" className={className} disabled={fetching} />
            <Toolbar.Button glyph="list" onClick={handlers.addItemsFromFiles} title="Add from playlist file" className={className} disabled={fetching} />
        </>}
        {!rootLevel && (editMode || largeScreen) &&
            <Toolbar.Button glyph="trash" title={`Delete (${HotKeys.delete})`} onClick={handlers.deleteItems} className={className} disabled={hasNoSelection} />}
        {editMode &&
            <Toolbar.Button glyph="ui-checks" onClick={handlers.selectAll} className={className} />}
        {!editMode && !largeScreen &&
            <Toolbar.Button glyph="pen" onClick={handlers.toggleEditMode} className={className} disabled={fetching} />}
    </Toolbar>
}