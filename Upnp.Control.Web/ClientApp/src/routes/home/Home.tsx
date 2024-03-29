import "bootstrap/js/dist/collapse";
import React, {
    ComponentType, DetailsHTMLAttributes, HTMLAttributes, SyntheticEvent,
    useCallback, useMemo, useRef, useState, useSyncExternalStore
} from "react";
import { DataList } from "../../components/DataList";
import ConfirmDialog from "../../components/Dialog.Confirmation";
import { DialogHost, IDialogHost } from "../../components/DialogHost";
import Spoiler from "../../components/Spoiler";
import Toolbar from "../../components/Toolbar";
import { BookmarkService, deviceBookmarks, itemBookmarks, playlistBookmarks } from "../../services/BookmarkService";
import { BookmarkGroup, profile } from "../common/Settings";
import { KnownWidgets, Widgets } from "../common/widgets/Widgets";

export default function () {
    return <div className="d-grid p-3 pb-7 g-3 overflow-auto">
        <Bookmarks group="devices" name="accordion" store={deviceBookmarks} caption="Favourite devices" icon="important_devices"
            keygen={genDeviceKey} />
        <Bookmarks group="items" name="accordion" store={itemBookmarks} caption="Favourite items" icon="bookmark_added"
            keygen={genItemKey} />
        <Bookmarks group="playlists" name="accordion" store={playlistBookmarks} caption="Favourite playlists" icon="heart_check"
            keygen={genItemKey} />
    </div>
}

type BoormarksProps<TKey extends (string | string[]), TProps> = {
    store: BookmarkService<TKey, TProps>;
    keygen(props: Partial<TProps>): string;
    caption: string;
    icon: string;
    group: BookmarkGroup;
} & DetailsHTMLAttributes<HTMLDetailsElement>

function Bookmarks<TKey extends (string | string[]), TProps>({ store, caption, icon, keygen, group, ...other }: BoormarksProps<TKey, TProps>) {
    const dialogHostRef = useRef<IDialogHost>();
    const bookmarks = useSyncExternalStore(store.subscribe, store.getSnapshot);
    const count = bookmarks?.length ?? 0;
    const [editMode, setEditMode] = useState(false);
    const toggleHandler = useCallback(({ currentTarget: { open } }: SyntheticEvent<HTMLDetailsElement>) =>
        profile.home.set(`expand.${group}`, open), [group]);
    const captionElement = useMemo(() => (<>
        <svg className="icon"><use href={`symbols.svg#${icon}`} /></svg>
        {caption}
        <span className="badge rounded-pill text-bg-error">{count}</span>
    </>), [count, caption, icon]);
    const toggleEditModeHandler = useCallback(() => setEditMode(value => !value), []);
    const deleteHandler = useCallback((_: number, key?: string) => {
        if (key) store.remove(key.split(":") as TKey);
    }, [store]);
    const deleteAllHandler = useCallback(() => {
        if (group) {
            const confirmHandler = () => store.clear();
            dialogHostRef.current?.show(
                <ConfirmDialog onConfirmed={confirmHandler}
                    caption="Clear bookmarks?" confirmText="Clear">
                    This action will delete all bookmarks in '{caption}'.
                </ConfirmDialog>
            )
        }
    }, [caption, group, store]);

    return <Spoiler name="accordion" className="border-0 bg-surface-cntr-low"
        open={profile.home.get(`expand.${group as BookmarkGroup}`)} onToggle={toggleHandler}
        caption={captionElement} {...other}>
        {bookmarks && bookmarks.length > 0 ?
            <div className="d-flex flex-nowrap align-items-center">
                <DataList className="grid-auto-m15 overflow-clip" template={ItemContainer}
                    editable editMode={editMode} onToggleModeRequested={toggleEditModeHandler}
                    onDeleteRequested={deleteHandler}>
                    {bookmarks.map(({ widget, props }) => React.createElement(
                        Widgets[widget as KnownWidgets] as ComponentType,
                        { ...props, key: keygen(props) }))}
                </DataList>
                {editMode && <Toolbar.Button className="btn btn-icon m-3 ms-0 d-none d-md-block"
                    icon={"symbols.svg#delete_forever"} title="Delete all items."
                    onClick={deleteAllHandler} />}
                <Toolbar.Button className="btn btn-icon btn-tone m-3 ms-0 d-none d-md-block"
                    icon={editMode ? "symbols.svg#edit_off" : "symbols.svg#edit"} title="Toggle edit list mode."
                    onClick={toggleEditModeHandler} />
            </div> :
            <div className="p-3 text-center">[No items bookmarked yet]</div>}
        <DialogHost ref={dialogHostRef} />
    </Spoiler>
}

function ItemContainer({ children, className, ...other }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`${className ? `${className} ` : ""}rounded-3 text-bg-primary-cntr`} {...other}>
        {children}
    </div>
}

function genDeviceKey({ category, device }: { category: string; device: string }): string {
    return category + ":" + device;
}

function genItemKey({ device, id }: { device: string; id: string }): string {
    return device + ":" + id;
}