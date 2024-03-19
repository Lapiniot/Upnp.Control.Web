import { PropsWithChildren, UIEvent, useCallback, useContext } from "react";
import { MenuItem, MenuItemSeparator } from "../../../components/Menu";
import { PlaybackStateContext } from "../../common/PlaybackStateContext";
import { RowState, useRowStates } from "../../../components/RowStateContext";
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
            ? <MenuItem action="pause" icon="symbols.svg#pause" onClick={pauseCallback}>Pause</MenuItem>
            : <MenuItem action="play" icon="symbols.svg#play_arrow" data-index={index} onClick={playItemCallback}>Play</MenuItem>}
        {root
            ? <>
                <MenuItem action="add-items" icon="symbols.svg#add" data-index={index} onClick={h.addItems}>Add from media server</MenuItem>
                <MenuItem action="add-url" icon="symbols.svg#podcasts" data-index={index} onClick={h.addUrl}>Add Internet stream url</MenuItem>
                <MenuItem action="add-files" icon="symbols.svg#feed" data-index={index} onClick={h.addFiles}>Add from playlist file</MenuItem>
                <MenuItem action="rename" icon="symbols.svg#drive_file_rename_outline" data-index={index} onClick={h.rename}>Rename</MenuItem>
                <MenuItem action="delete" icon="symbols.svg#delete" data-index={index} onClick={h.delete}>Delete</MenuItem>
                <MenuItem action="copy" icon="symbols.svg#content_copy" data-index={index} onClick={h.copy}>Copy</MenuItem>
            </> : <>
                <MenuItem action="delete-items" icon="symbols.svg#delete" data-index={index} onClick={h.deleteItems}>Delete item</MenuItem>
            </>}
        <MenuItemSeparator />
        <MenuItem action="info" icon="symbols.svg#info" data-index={index} onClick={h.showInfo}>Get Info</MenuItem>
    </>
}