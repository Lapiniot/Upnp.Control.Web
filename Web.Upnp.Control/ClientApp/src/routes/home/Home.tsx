import { Bookmarks } from "../../components/BookmarkService";
import { Widgets } from "../common/widgets/Widgets";

export default () => {
    const bookmarks = Bookmarks.getAll();
    return <div className="d-grid grid-auto-x0 align-items-start m-3">
        {Object.keys(bookmarks).map(key => {
            const { widget, props } = bookmarks[key];
            return Widgets.createElement(widget, { ...props, key: key });
        })}
    </div>;
}