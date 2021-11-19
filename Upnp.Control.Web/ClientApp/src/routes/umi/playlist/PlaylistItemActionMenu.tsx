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
            ? <MenuItem action="pause" glyph="pause" onClick={ph.pause}>Pause</MenuItem>
            : <MenuItem action="play" glyph="play" data-index={index} onClick={ph.playItem}>Play</MenuItem>}
        {root
            ? <>
                <MenuItem action="add-items" glyph="plus" data-index={index} onClick={h.addItems}>Add from media server</MenuItem>
                <MenuItem action="add-url" glyph="broadcast-tower" data-index={index} onClick={h.addUrl}>Add Internet stream url</MenuItem>
                <MenuItem action="add-files" glyph="list" data-index={index} onClick={h.addFiles}>Add from playlist file</MenuItem>
                <MenuItem action="rename" glyph="edit" data-index={index} onClick={h.rename}>Rename</MenuItem>
                <MenuItem action="delete" glyph="trash" data-index={index} onClick={h.delete}>Delete</MenuItem>
                <MenuItem action="copy" glyph="copy" data-index={index} onClick={h.copy}>Copy</MenuItem>
            </> : <>
                <MenuItem action="delete-items" glyph="trash" data-index={index} onClick={h.deleteItems}>Delete item</MenuItem>
            </>}
        <MenuItem action="info" glyph="info" data-index={index} onClick={h.showInfo}>Get Info</MenuItem>
    </>;
}