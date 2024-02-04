import "bootstrap/js/dist/collapse";
import React, { MouseEvent, useCallback, useEffect, useState } from "react";
import { deviceBookmarks, getBookmarkData, itemBookmarks, playlistBookmarks } from "../../services/BookmarkService";
import { DataList, DeleteRowHandler } from "../../components/DataList";
import { BookmarkGroup, profile } from "../common/Settings";
import { KnownWidgets, Widgets } from "../common/widgets/Widgets";

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

    const deleteHandler = useCallback<DeleteRowHandler>((_: any, itemKey, tag) => {
        if (typeof itemKey !== "string") return;
        if (tag === "devices") {
            const index = itemKey.indexOf(":");
            const keys = [itemKey.substring(0, index), itemKey.substring(index + 1)] as [string, string];
            deviceBookmarks.remove(keys).then(deviceBookmarks.getAll).then(bookmarks => update(bookmarks, null, null));
        }
        else if (tag === "playlists") {
            const index = itemKey.indexOf(":");
            const keys = [itemKey.substring(0, index), itemKey.substring(index + 1)] as [string, string];
            playlistBookmarks.remove(keys).then(playlistBookmarks.getAll).then(bookmarks => update(null, bookmarks, null));
        }
        else if (tag === "items") {
            const index = itemKey.indexOf(":");
            const keys = [itemKey.substring(0, index), itemKey.substring(index + 1)] as [string, string];
            itemBookmarks.remove(keys).then(itemBookmarks.getAll).then(bookmarks => update(null, null, bookmarks));
        }
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
                        <DataList className="accordion-body" tag={id} onDelete={deleteHandler}>
                            {value.map(({ key, widget, props }) => React.createElement(Widgets[widget] as any, { ...props, key: key }))}
                        </DataList> :
                        <div className="text-muted p-3 text-center">[No items bookmarked yet]</div>}
                </div>
            </div>)}
        </div>
    </div>;
}