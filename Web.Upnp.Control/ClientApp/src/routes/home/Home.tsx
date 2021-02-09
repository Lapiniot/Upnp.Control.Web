import { Bookmarks } from "../../components/BookmarkService";
import { Widgets } from "../common/widgets/Widgets";

type Group = [string, { widget: string, props: any }[]];

export default () => {
    const data: { [key in "devices" | "playlists" | "items"]: Group } = {
        "devices": ["Favourite devices", []],
        "playlists": ["Favourite playlists", []],
        "items": ["Favourite items", []],
    }

    Object.entries(Bookmarks.getAll()).forEach(([key, value]) => {
        if (key.startsWith("dev:"))
            data.devices[1].push(value);
        else if (key.startsWith("play:"))
            data.playlists[1].push(value);
        else if (key.startsWith("item:"))
            data.items[1].push(value);
    });

    return <div className="accordion accordion-flush" id="bookmarks-section">
        {Object.entries(data).map(([id, value], i) => <div className="accordion-item" key={id}>
            <h2 className="accordion-header" id={`h-${id}`}>
                <button type="button" className={`accordion-button${i > 0 ? " collapsed" : ""}`} data-bs-toggle="collapse"
                    data-bs-target={`#${id}`} aria-expanded={i === 0 ? "true" : "false"}
                    aria-controls={id}>{value[0]}</button>
            </h2>
            <div id={id} className={`accordion-collapse collapse${i === 0 ? " show" : ""}`}
                aria-labelledby={`h-${id}`} data-bs-parent="#bookmarks-section">
                {value[1].length > 0
                    ? <div className="accordion-body d-grid grid-auto-x0 align-items-start">
                        {Object.entries(value[1]).map(([key, { widget, props }]) => Widgets.createElement(widget, { ...props, key: key }))}
                    </div>
                    : <div className="d-flex text-muted p-3 justify-content-center">[No items bookmarked yet]</div>}
            </div>
        </div>)}
    </div >;
}