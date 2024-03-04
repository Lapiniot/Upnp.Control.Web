import "bootstrap/js/dist/collapse";
import React, { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { DataList, DeleteRowHandler } from "../../components/DataList";
import ConfirmDialog from "../../components/Dialog.Confirmation";
import DialogHost from "../../components/DialogHost";
import { BookmarkService } from "../../services/BookmarkService";
import { BookmarkGroup, profile } from "../common/Settings";
import { KnownWidgets, Widgets } from "../common/widgets/Widgets";

type State = { [K in BookmarkGroup]: { widget: KnownWidgets; props: {} }[] }
type Group = [BookmarkGroup, State["devices"]]

const groups: { [K in BookmarkGroup]: [title: string, icon: string, idGenerator: (props: any) => string] } = {
    "devices": ["Favourite devices", "important_devices", p => `${p.category}:${p.device}`],
    "items": ["Favourite items", "bookmark_added", p => `${p.device}:${p.id}`],
    "playlists": ["Favourite playlists", "heart_check", p => `${p.device}:${p.id}`]
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

    const clickHandler = useCallback(({ currentTarget: { classList, attributes } }: MouseEvent) =>
        profile.home.set("expandSection", !classList.contains("collapsed")
            ? attributes.getNamedItem("aria-controls")?.value as BookmarkGroup : ""), []);

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

    const expanded = profile.home.get("expandSection");

    return <div className="overflow-auto">
        <div className="accordion accordion-flush pb-3 pb-sm-fab" id="bookmarks-section">
            {(Object.entries(data) as Group[]).map(([id, value]) => <div className="accordion-item" key={id}>
                <h2 className="accordion-header" id={`h-${id}`}>
                    <button type="button" className={`accordion-button${id !== expanded ? " collapsed" : ""}`} data-bs-toggle="collapse"
                        data-bs-target={`#${id}`} aria-expanded={id === expanded ? "true" : "false"}
                        aria-controls={id} onClick={clickHandler}>
                        <svg className="me-1">
                            <use href={`symbols.svg#${groups[id][1]}`} />
                        </svg>
                        {groups[id][0]}
                        <span className="badge rounded-pill bg-secondary ms-1 small">{value.length}</span></button>
                </h2>
                <div id={id} className={`accordion-collapse collapse${id === expanded ? " show" : ""}`}
                    aria-labelledby={`h-${id}`} data-bs-parent="#bookmarks-section">
                    {value.length > 0 ?
                        <DataList className="accordion-body" tag={id} editable
                            onDelete={deleteHandler} onDeleteAll={deleteAllHandler}>
                            {value.map(({ widget, props }) =>
                                React.createElement(Widgets[widget] as any, { ...props, key: groups[id][2](props) }))}
                        </DataList> :
                        <div className="text-muted p-3 text-center">[No items bookmarked yet]</div>}
                </div>
            </div>)}
        </div>
        <DialogHost ref={dialogHostRef} />
    </div>
}