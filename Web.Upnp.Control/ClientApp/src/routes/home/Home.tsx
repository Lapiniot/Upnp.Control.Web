import React from "react";
import { DeviceBookmarks as Bookmarks } from "../../components/BookmarkService";
import { Widgets } from "../common/widgets/Widgets";

type Groups = "devices" | "playlists" | "items";
type HomeState = {
    data: { [K in Groups]: [string, { key: string, widget: string, props: any }[]] };
};

export default class extends React.Component<{}, HomeState> {

    state: HomeState = {
        data: {
            "devices": ["Favourite devices", []],
            "playlists": ["Favourite playlists", []],
            "items": ["Favourite items", []],
        }
    };

    async componentDidMount() {
        const bookmarks = await Bookmarks.getAll();
        this.setState(state => {
            const data = { ...state.data };
            data.devices[1] = bookmarks.map(({ widget, props }) => ({ key: `${props.category}:${props.device}`, widget, props }));
            return { data: data };
        });
    }

    render() {
        return <div className="accordion accordion-flush" id="bookmarks-section">
            {Object.entries(this.state.data).map(([id, value], i) => <div className="accordion-item" key={id}>
                <h2 className="accordion-header" id={`h-${id}`}>
                    <button type="button" className={`accordion-button${i > 0 ? " collapsed" : ""}`} data-bs-toggle="collapse"
                        data-bs-target={`#${id}`} aria-expanded={i === 0 ? "true" : "false"}
                        aria-controls={id}>{value[0]}</button>
                </h2>
                <div id={id} className={`accordion-collapse collapse${i === 0 ? " show" : ""}`}
                    aria-labelledby={`h-${id}`} data-bs-parent="#bookmarks-section">
                    {value[1].length > 0
                        ? <div className="accordion-body d-grid grid-auto-x0 align-items-start">
                            {value[1].map(({ key, widget, props }) => Widgets.createElement(widget, { ...props, key: key }))}
                        </div>
                        : <div className="d-flex text-muted p-3 justify-content-center">[No items bookmarked yet]</div>}
                </div>
            </div>)}
        </div >;
    }
}