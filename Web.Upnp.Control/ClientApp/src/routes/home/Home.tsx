import { Bookmarks } from "../../components/BookmarkService";
import { Widgets } from "../common/widgets/Widgets";

export default () => {
    const bookmarks = Bookmarks.getAll();
    return <div className="d-grid grid-auto-x0 align-items-start m-3">
        {Object.keys(bookmarks).map(k => bookmarks[k]).map(b => Widgets.createInstance(b.widget, b.props))}
    </div>;
}