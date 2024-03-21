import "bootstrap/js/dist/collapse";
import React, { ComponentType, HTMLAttributes, SyntheticEvent, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { DataList } from "../../components/DataList";
import ConfirmDialog from "../../components/Dialog.Confirmation";
import { DialogHost, IDialogHost } from "../../components/DialogHost";
import Spoiler from "../../components/Spoiler";
import { BookmarkService } from "../../services/BookmarkService";
import { BookmarkGroup, profile } from "../common/Settings";
import { KnownWidgets, Widgets } from "../common/widgets/Widgets";
import Toolbar from "../../components/Toolbar";

type State = { [K in BookmarkGroup]: { widget: KnownWidgets; props: object }[] }
type Group = [BookmarkGroup, State["devices"]]

/* eslint-disable @typescript-eslint/no-explicit-any */
const groups: { [K in BookmarkGroup]: [title: string, icon: string, idGenerator: (props: unknown) => string] } = {
    "devices": ["Favourite devices", "important_devices", (p: any) => `${p.category}:${p.device}`],
    "items": ["Favourite items", "bookmark_added", (p: any) => `${p.device}:${p.id}`],
    "playlists": ["Favourite playlists", "heart_check", (p: any) => `${p.device}:${p.id}`]
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function renderCaption(caption: string, icon: string, count: number): React.ReactNode {
    return <>
        <svg className="icon"><use href={`symbols.svg#${icon}`} /></svg>
        {caption}
        {count ? <span className="badge rounded-pill text-bg-error">{count}</span> : undefined}
    </>;
}

export default function () {
    const [data, setData] = useState<State>({ devices: [], playlists: [], items: [] });
    const [editMode, setEditMode] = useState<{ [k in keyof State]: boolean }>({ devices: false, playlists: false, items: false });
    const dialogHostRef = useRef<IDialogHost>();

    useEffect(() => {
        const stores = Object.getOwnPropertyNames(groups);
        Promise.all(stores.map(store => new BookmarkService(store).getAll().then(data => ({ [store]: data }))))
            .then(bookmarks => bookmarks.reduce((acc, current) => ({ ...acc, ...current }), {}))
            .then(data => setData(data as State));
    }, []);

    const toggleHandler = useCallback(({ currentTarget: { dataset: { group }, open } }: SyntheticEvent<HTMLDetailsElement>) =>
        profile.home.set(`expand.${group as BookmarkGroup}`, open), []);

    const toggleEditMode = useCallback((group?: BookmarkGroup) => {
        if (!group) return;
        setEditMode(s => ({ ...s, [group]: !s[group] }));
    }, []);

    const toggleEditModeHandler = useCallback(({ currentTarget: { dataset: { group } } }: MouseEvent<HTMLElement>) => {
        if (!group) return;
        setEditMode(s => ({ ...s, [group]: !s[group as BookmarkGroup] }));
    }, []);

    const deleteHandler = useCallback(async (_: number, itemKey: string | null | undefined, group?: BookmarkGroup) => {
        if (!itemKey || !group) return;

        const index = itemKey.indexOf(":");
        const key = [itemKey.substring(0, index), itemKey.substring(index + 1)];
        const service = new BookmarkService(group);
        await service.remove(key);
        const bookmarks = await service.getAll();
        setData(state => ({ ...state, [group]: bookmarks }));
    }, []);

    const deleteAllHandler = useCallback(({ currentTarget: { dataset: { group } } }: MouseEvent<HTMLElement>) => {
        if (!group) return;

        const confirmHandler = () => {
            const service = new BookmarkService(group as BookmarkGroup);
            service.clear().then(() => setData(data => ({ ...data, [group]: [] })));
        }

        dialogHostRef.current?.show(
            <ConfirmDialog className="dialog-auto" onConfirmed={confirmHandler} caption="Clear bookmarks?"
                confirmText="Clear" confirmColor="error">
                This action will delete all bookmarks in '{groups[group as BookmarkGroup][0]}'.
            </ConfirmDialog>
        )
    }, []);

    return <div className="d-grid p-3 pb-7 g-3 overflow-auto">
        {(Object.entries(data) as Group[]).map(([id, value]) =>
            <Spoiler name="accordion" className="border-0 bg-surface-cntr-low"
                open={profile.home.get(`expand.${id}`)} onToggle={toggleHandler}
                caption={renderCaption(groups[id][0], groups[id][1], value.length)} data-group={id} key={id}>
                {value.length > 0 ?
                    <div className="d-flex flex-nowrap align-items-center">
                        <DataList className="grid-auto-m15 overflow-clip" context={id} editable template={ItemContainer}
                            editMode={editMode[id]} onToggleModeRequested={toggleEditMode} onDeleteRequested={deleteHandler}>
                            {value.map(({ widget, props }) =>
                                React.createElement(Widgets[widget] as ComponentType, { ...props, key: groups[id][2](props) }))}
                        </DataList>
                        {editMode[id] && <Toolbar.Button className="btn btn-icon m-3 ms-0 d-none d-md-block"
                            icon={"symbols.svg#delete_forever"} data-group={id}
                            onClick={deleteAllHandler} title="Delete all items." />}
                        <Toolbar.Button className="btn btn-icon btn-tone m-3 ms-0 d-none d-md-block"
                            icon={editMode ? "symbols.svg#edit_off" : "symbols.svg#edit"} data-group={id}
                            onClick={toggleEditModeHandler} title="Toggle edit list mode." />
                    </div> :
                    <div className="p-3 text-center">[No items bookmarked yet]</div>}
            </Spoiler>)}
        <DialogHost ref={dialogHostRef} />
    </div>
}

function ItemContainer({ children, className, ...other }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`${className ? `${className} ` : ""}rounded-3 text-bg-primary-cntr`} {...other}>
        {children}
    </div>
}