import "bootstrap/js/dist/collapse";
import React, { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { BookmarkService, deviceBookmarks, getBookmarkData, itemBookmarks, playlistBookmarks } from "../../services/BookmarkService";
import { DataList, DeleteRowHandler } from "../../components/DataList";
import { BookmarkGroup, profile } from "../common/Settings";
import { KnownWidgets, Widgets } from "../common/widgets/Widgets";
import DialogHost from "../../components/DialogHost";
import ConfirmDialog from "../../components/Dialog.Confirmation";

type WC<T> = { widget: string, props: T }[] | null

type State = { [K in BookmarkGroup]: { key: string; widget: KnownWidgets; props: any; }[] }
type Group = [BookmarkGroup, State["devices"]]

const headers: { [K in BookmarkGroup]: [title: string, icon: string] } = {
    "devices": ["Favourite devices", "important_devices"],
    "items": ["Favourite items", "bookmark_added"],
    "playlists": ["Favourite playlists", "heart_check"]
}

export default function () {
    const [data, setData] = useState<State>({ "devices": [], "playlists": [], "items": [] });
    const dialogHostRef = useRef<DialogHost>(null);

    const update = useCallback((devices?: WC<{ category: string, device: string }>, playlists?: WC<{ device: string, id: string }>, items?: WC<{ device: string, id: string }>) =>
        setData(prev => ({
            devices: devices ? devices.map(({ widget, props }) => ({ key: `${props.category}:${props.device}`, widget: widget as KnownWidgets, props })) : prev.devices,
            playlists: playlists ? playlists.map(({ widget, props }) => ({ key: `${props.device}:${props.id}`, widget: widget as KnownWidgets, props })) : prev.playlists,
            items: items ? items.map(({ widget, props }) => ({ key: `${props.device}:${props.id}`, widget: widget as KnownWidgets, props })) : prev.items
        })), []);

    useEffect(() => { getBookmarkData().then(r => update(r.devices, r.playlists, r.items)) }, []);

    const clickHandler = useCallback(({ currentTarget: { classList, attributes } }: MouseEvent) =>
        profile.home.set("expandSection", !classList.contains("collapsed")
            ? attributes.getNamedItem("aria-controls")?.value as BookmarkGroup : ""), []);

    const deleteHandler = useCallback<DeleteRowHandler>((_: any, itemKey, group) => {
        if (typeof itemKey !== "string") return;
        if (group === "devices") {
            const index = itemKey.indexOf(":");
            const keys = [itemKey.substring(0, index), itemKey.substring(index + 1)] as [string, string];
            deviceBookmarks.remove(keys).then(deviceBookmarks.getAll).then(bookmarks => update(bookmarks, null, null));
        }
        else if (group === "playlists") {
            const index = itemKey.indexOf(":");
            const keys = [itemKey.substring(0, index), itemKey.substring(index + 1)] as [string, string];
            playlistBookmarks.remove(keys).then(playlistBookmarks.getAll).then(bookmarks => update(null, bookmarks, null));
        }
        else if (group === "items") {
            const index = itemKey.indexOf(":");
            const keys = [itemKey.substring(0, index), itemKey.substring(index + 1)] as [string, string];
            itemBookmarks.remove(keys).then(itemBookmarks.getAll).then(bookmarks => update(null, null, bookmarks));
        }
    }, []);

    const deleteAllHandler = useCallback((group: any) => {
        const confirmHandler = () => {
            new BookmarkService(group).clear().then(() => setData(data => ({ ...data, [group]: [] })))
        }

        dialogHostRef.current?.show(
            <ConfirmDialog className="dialog-auto" onConfirmed={confirmHandler} caption="Clear bookmarks?"
                confirmText="Clear" confirmColor="danger">
                This action will delete all bookmarks in '{headers[group as BookmarkGroup][0]}'.
            </ConfirmDialog>
        );
    }, []);

    const expanded = profile.home.get("expandSection");

    return <div className="overflow-auto">
        <div className="accordion accordion-flush" id="bookmarks-section">
            {(Object.entries(data) as Group[]).map(([id, value]) => <div className="accordion-item" key={id}>
                <h2 className="accordion-header" id={`h-${id}`}>
                    <button type="button" className={`accordion-button${id !== expanded ? " collapsed" : ""}`} data-bs-toggle="collapse"
                        data-bs-target={`#${id}`} aria-expanded={id === expanded ? "true" : "false"}
                        aria-controls={id} onClick={clickHandler}>
                        <svg className="me-1">
                            <use href={`symbols.svg#${headers[id][1]}`} />
                        </svg>
                        {headers[id][0]}
                        <span className="badge rounded-pill bg-secondary ms-1 small">{value.length}</span></button>
                </h2>
                <div id={id} className={`accordion-collapse collapse${id === expanded ? " show" : ""}`}
                    aria-labelledby={`h-${id}`} data-bs-parent="#bookmarks-section">
                    {value.length > 0 ?
                        <DataList className="accordion-body" tag={id} editable
                            onDelete={deleteHandler} onDeleteAll={deleteAllHandler}>
                            {value.map(({ key, widget, props }) =>
                                React.createElement(Widgets[widget] as any, { ...props, key: key }))}
                        </DataList> :
                        <div className="text-muted p-3 text-center">[No items bookmarked yet]</div>}
                </div>
            </div>)}
        </div>
        <DialogHost ref={dialogHostRef} />
    </div>
}