import { PropsWithChildren, UIEvent, useCallback, useContext } from "react";
import { MenuItem, MenuItemSeparator } from "../../../components/DropdownMenu";
import { PlaybackStateContext } from "../../common/PlaybackStateContext";
import { RowState, useRowStates } from "../../common/RowStateContext";
import { PlaylistMenuActionHandlers } from "./PlaylistMenuActionHandlers";

type PlaylistItemActionMenuProps = {
    index: number,
    root: boolean,
    getTrackUrlHook(index: number): string | undefined,
    handlers: Partial<PlaylistMenuActionHandlers>
}

export function PlaylistItemActionMenu({ index, root, getTrackUrlHook, handlers: h }: PropsWithChildren<PlaylistItemActionMenuProps>) {
    const { get: getState } = useRowStates();
    const { state: { state }, dispatch } = useContext(PlaybackStateContext);
    const playItemCallback = useCallback(({ currentTarget: { dataset: { index } } }: UIEvent<HTMLElement>) => {
        if (index) {
            const url = getTrackUrlHook(parseInt(index));
            if (url) {
                dispatch({ type: "PLAY_URL", url })
            }
        }
    }, [getTrackUrlHook, dispatch]);
    const pauseCallback = useCallback(() => dispatch({ type: "PAUSE" }), [dispatch]);
    const active = !!(getState(index) & RowState.Active);
    return <>
        {active && state === "PLAYING"
            ? <MenuItem action="pause" glyph="symbols.svg#pause" onClick={pauseCallback}>Pause</MenuItem>
            : <MenuItem action="play" glyph="symbols.svg#play_arrow" data-index={index} onClick={playItemCallback}>Play</MenuItem>}
        {root
            ? <>
                <MenuItem action="add-items" glyph="symbols.svg#add" data-index={index} onClick={h.addItems}>Add from media server</MenuItem>
                <MenuItem action="add-url" glyph="symbols.svg#podcasts" data-index={index} onClick={h.addUrl}>Add Internet stream url</MenuItem>
                <MenuItem action="add-files" glyph="symbols.svg#feed" data-index={index} onClick={h.addFiles}>Add from playlist file</MenuItem>
                <MenuItem action="rename" glyph="symbols.svg#drive_file_rename_outline" data-index={index} onClick={h.rename}>Rename</MenuItem>
                <MenuItem action="delete" glyph="symbols.svg#delete" data-index={index} onClick={h.delete}>Delete</MenuItem>
                <MenuItem action="copy" glyph="symbols.svg#content_copy" data-index={index} onClick={h.copy}>Copy</MenuItem>
            </> : <>
                <MenuItem action="delete-items" glyph="symbols.svg#delete" data-index={index} onClick={h.deleteItems}>Delete item</MenuItem>
            </>}
        <MenuItemSeparator />
        <MenuItem action="info" glyph="symbols.svg#info" data-index={index} onClick={h.showInfo}>Get Info</MenuItem>
    </>
}