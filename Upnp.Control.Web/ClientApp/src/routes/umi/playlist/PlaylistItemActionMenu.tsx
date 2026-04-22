import Menu from "@components/Menu";
import { RowState, useRowStates } from "@components/RowStateContext";
import { PlaybackStateContext } from "@routes/common/PlaybackStateContext";
import type { PlaylistMenuActionHandlers } from "@routes/umi/playlist/PlaylistMenuActionHandlers";
import { type PropsWithChildren, type UIEvent, useCallback, useContext } from "react";

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
            ? <Menu.Item action="pause" icon="symbols.svg#pause" onClick={pauseCallback}>Pause</Menu.Item>
            : <Menu.Item action="play" icon="symbols.svg#play_arrow" data-index={index} onClick={playItemCallback}>Play</Menu.Item>}
        {root
            ? <>
                <Menu.Item action="add-items" icon="symbols.svg#add" data-index={index} onClick={h.addItems}>Add from media server</Menu.Item>
                <Menu.Item action="add-url" icon="symbols.svg#podcasts" data-index={index} onClick={h.addUrl}>Add Internet stream url</Menu.Item>
                <Menu.Item action="add-files" icon="symbols.svg#feed" data-index={index} onClick={h.addFiles}>Add from playlist file</Menu.Item>
                <Menu.Item action="rename" icon="symbols.svg#drive_file_rename_outline" data-index={index} onClick={h.rename}>Rename</Menu.Item>
                <Menu.Item action="delete" icon="symbols.svg#delete" data-index={index} onClick={h.delete}>Delete</Menu.Item>
                <Menu.Item action="copy" icon="symbols.svg#content_copy" data-index={index} onClick={h.copy}>Copy</Menu.Item>
            </> : <>
                <Menu.Item action="delete-items" icon="symbols.svg#delete" data-index={index} onClick={h.deleteItems}>Delete item</Menu.Item>
            </>}
        <Menu.Separator />
        <Menu.Item action="info" icon="symbols.svg#info" data-index={index} onClick={h.showInfo}>Get Info</Menu.Item>
    </>
}