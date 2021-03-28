import React, { useCallback, useEffect, useState, MouseEvent } from "react";
import { getBookmarkData } from "../../components/BookmarkService";
import { BookmarkGroup, profile } from "../common/Settings";
import { PlaySvgSymbols } from "../common/SvgSymbols";
import { KnownWidgets, Widgets } from "../common/widgets/Widgets";

type State = { [K in BookmarkGroup]: { key: string, widget: KnownWidgets, props: any }[] };

const headers: { [K in BookmarkGroup]: string } = {
    "devices": "Favourite devices",
    "items": "Favourite items",
    "playlists": "Favourite playlists"
}

export default function () {
    const [data, setData] = useState<State>({ "devices": [], "playlists": [], "items": [] });

    useEffect(() => {
        getBookmarkData().then(r => {
            setData({
                devices: r.devices.map(({ widget, props }) => ({ key: `${props.category}:${props.device}`, widget: widget as KnownWidgets, props })),
                playlists: r.playlists.map(({ widget, props }) => ({ key: `${props.device}:${props.id}`, widget: widget as KnownWidgets, props })),
                items: r.items.map(({ widget, props }) => ({ key: `${props.device}:${props.id}`, widget: widget as KnownWidgets, props }))
            })
        })
    }, []);

    const clickHandler = useCallback(({ currentTarget: { classList, attributes } }: MouseEvent) =>
        profile.home.set("expandSection", !classList.contains("collapsed")
            ? attributes.getNamedItem("aria-controls")?.value as BookmarkGroup : ""), []);

    const expanded = profile.home.get("expandSection");

    return <div className="overflow-auto">
        <PlaySvgSymbols />
        <div className="accordion accordion-flush" id="bookmarks-section">
            {Object.entries(data).map(([id, value], i) => <div className="accordion-item" key={id}>
                <h2 className="accordion-header" id={`h-${id}`}>
                    <button type="button" className={`accordion-button${id !== expanded ? " collapsed" : ""}`} data-bs-toggle="collapse"
                        data-bs-target={`#${id}`} aria-expanded={id === expanded ? "true" : "false"}
                        aria-controls={id} onClick={clickHandler}>{headers[id as BookmarkGroup]}<span className="badge rounded-pill bg-secondary ms-1 small">{value.length}</span></button>
                </h2>
                <div id={id} className={`accordion-collapse collapse${id === expanded ? " show" : ""}`}
                    aria-labelledby={`h-${id}`} data-bs-parent="#bookmarks-section">
                    {value.length > 0
                        ? <div className="accordion-body d-grid grid-auto-m15 align-items-start p-3">
                            {value.map(({ key, widget, props }) => React.createElement(Widgets[widget] as any, { ...props, key: key }))}
                        </div>
                        : <div className="d-flex text-muted p-3 justify-content-center">[No items bookmarked yet]</div>}
                </div>
            </div>)}
        </div>
    </div>;
}