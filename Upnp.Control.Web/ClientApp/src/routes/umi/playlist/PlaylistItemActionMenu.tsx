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
            ? <MenuItem action="pause" glyph="sprites.svg#pause" onClick={ph.pause}>Pause</MenuItem>
            : <MenuItem action="play" glyph="sprites.svg#play" data-index={index} onClick={ph.playItem}>Play</MenuItem>}
        {root
            ? <>
                <MenuItem action="add-items" glyph="sprites.svg#plus" data-index={index} onClick={h.addItems}>Add from media server</MenuItem>
                <MenuItem action="add-url" glyph="sprites.svg#tower-broadcast" data-index={index} onClick={h.addUrl}>Add Internet stream url</MenuItem>
                <MenuItem action="add-files" glyph="sprites.svg#file-lines" data-index={index} onClick={h.addFiles}>Add from playlist file</MenuItem>
                <MenuItem action="rename" glyph="sprites.svg#pen-to-square" data-index={index} onClick={h.rename}>Rename</MenuItem>
                <MenuItem action="delete" glyph="sprites.svg#trash" data-index={index} onClick={h.delete}>Delete</MenuItem>
                <MenuItem action="copy" glyph="sprites.svg#copy" data-index={index} onClick={h.copy}>Copy</MenuItem>
            </> : <>
                <MenuItem action="delete-items" glyph="sprites.svg#trash" data-index={index} onClick={h.deleteItems}>Delete item</MenuItem>
            </>}
        <MenuItem action="info" glyph="sprites.svg#info" data-index={index} onClick={h.showInfo}>Get Info</MenuItem>
    </>;
}