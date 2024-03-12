import "bootstrap/js/dist/collapse";
import React, { HTMLAttributes, SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { DataList, DeleteRowHandler } from "../../components/DataList";
import ConfirmDialog from "../../components/Dialog.Confirmation";
import DialogHost from "../../components/DialogHost";
import Spoiler from "../../components/Spoiler";
import { BookmarkService } from "../../services/BookmarkService";
import { BookmarkGroup, profile } from "../common/Settings";
import { KnownWidgets, Widgets } from "../common/widgets/Widgets";

type State = { [K in BookmarkGroup]: { widget: KnownWidgets; props: object }[] }
type Group = [BookmarkGroup, State["devices"]]

const groups: { [K in BookmarkGroup]: [title: string, icon: string, idGenerator: (props: unknown) => string] } = {
    "devices": ["Favourite devices", "important_devices", (p: any) => `${p.category}:${p.device}`],
    "items": ["Favourite items", "bookmark_added", (p: any) => `${p.device}:${p.id}`],
    "playlists": ["Favourite playlists", "heart_check", (p: any) => `${p.device}:${p.id}`]
}

function renderCaption(caption: string, icon: string, count: number): React.ReactNode {
    return <>
        <svg className="icon"><use href={`symbols.svg#${icon}`} /></svg>
        {caption}
        <span className="badge rounded-pill text-bg-primary">{count}</span>
    </>;
}

export default function () {
    const [data, setData] = useState<State>({ "devices": [], "playlists": [], "items": [] });
    const dialogHostRef = useRef<DialogHost>(null);

    useEffect(() => {
        const stores = Object.getOwnPropertyNames(groups);
        Promise.all(stores.map(store => new BookmarkService(store).getAll().then(data => ({ [store]: data }))))
            .then(bookmarks => bookmarks.reduce((acc, current) => ({ ...acc, ...current }), {}))
            .then(data => setData(data as State));
    }, []);

    const toggleHandler = useCallback(({ currentTarget: { dataset: { group }, open } }: SyntheticEvent<HTMLDetailsElement>) =>
        profile.home.set(`expand.${group as BookmarkGroup}`, open), []);

    const deleteHandler = useCallback<DeleteRowHandler>(async (_: any, itemKey, group) => {
        if (typeof itemKey !== "string" || typeof group !== "string") return;
        const index = itemKey.indexOf(":");
        const key = [itemKey.substring(0, index), itemKey.substring(index + 1)];
        const service = new BookmarkService(group);
        await service.remove(key);
        const bookmarks = await service.getAll();
        setData(state => ({ ...state, [group]: bookmarks }));
    }, []);

    const deleteAllHandler = useCallback((group: any) => {
        const confirmHandler = () => {
            const service = new BookmarkService(group);
            service.clear().then(() => setData(data => ({ ...data, [group]: [] })));
        }

        dialogHostRef.current?.show(
            <ConfirmDialog className="dialog-auto" onConfirmed={confirmHandler} caption="Clear bookmarks?"
                confirmText="Clear" confirmColor="danger">
                This action will delete all bookmarks in '{groups[group as BookmarkGroup][0]}'.
            </ConfirmDialog>
        );
    }, []);

    return <div className="d-grid p-3 pb-7 g-3 overflow-auto">
        {(Object.entries(data) as Group[]).map(([id, value]) =>
            <Spoiler name="accordion" className="shadow-sm bg-light-subtle border-light-subtle"
                open={profile.home.get(`expand.${id}`)} onToggle={toggleHandler}
                caption={renderCaption(groups[id][0], groups[id][1], value.length)} data-group={id} key={id}>
                {value.length > 0 ?
                    <DataList className="grid-auto-m15 overflow-clip" tag={id} editable template={ItemContainer}
                        onDelete={deleteHandler} onDeleteAll={deleteAllHandler}>
                        {value.map(({ widget, props }) =>
                            React.createElement(Widgets[widget] as any, { ...props, key: groups[id][2](props) }))}
                    </DataList> :
                    <div className="text-muted p-3 text-center">[No items bookmarked yet]</div>}
            </Spoiler>)}
        <DialogHost ref={dialogHostRef} />
    </div>
}

function ItemContainer({ children, className, ...other }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`${className ? `${className} ` : ""}rounded-3 bg-primary bg-opacity-10`} {...other}>
        {children}
    </div>
}