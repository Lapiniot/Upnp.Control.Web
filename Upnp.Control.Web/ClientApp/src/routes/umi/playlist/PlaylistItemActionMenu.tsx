import { PropsWithChildren } from "react";
import { MenuItem } from "../../../components/DropdownMenu";
import { useRowStates } from "../../common/RowStateContext";
import { RowState } from "../../common/Types";
import { usePlaybackState } from "./PlaybackStateContext";
import { PlaylistMenuActionHandlers } from "./PlaylistMenuActionHandlers";

type PlaylistItemActionMenuProps = {
    index: number;
    root: boolean;
    handlers: Partial<PlaylistMenuActionHandlers>;
}

export function PlaylistItemActionMenu({ index, root, handlers: h }: PropsWithChildren<PlaylistItemActionMenuProps>) {
    const { get: getState } = useRowStates();
    const { state: state, handlers: ph } = usePlaybackState();
    const active = !!(getState(index) & RowState.Active);
    return <>
        {active && state === "PLAYING"
            ? <MenuItem action="pause" glyph="symbols.svg#pause" onClick={ph.pause}>Pause</MenuItem>
            : <MenuItem action="play" glyph="symbols.svg#play_arrow" data-index={index} onClick={ph.playItem}>Play</MenuItem>}
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
        <MenuItem action="info" glyph="symbols.svg#info" data-index={index} onClick={h.showInfo}>Get Info</MenuItem>
    </>;
}