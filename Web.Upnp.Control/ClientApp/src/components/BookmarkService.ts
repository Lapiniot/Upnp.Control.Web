const STORAGE_KEY = "bookmarks";

type Bookmark = { widget: string, "props": any };
type BookmarkMap = { [key: string]: Bookmark };

class BookmarkService {

    map: BookmarkMap | null = null;

    private load(): BookmarkMap {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }

    private save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.getAll()));
    }

    getAll(): BookmarkMap {
        this.map = this.map ?? this.load();
        return this.map;
    }

    add(key: string, widgetName: string, props?: {}) {
        const bookmarks = this.getAll();
        bookmarks[key] = { "widget": widgetName, "props": props };
        this.save();
    }

    remove(key: string) {
        const bookmarks = this.getAll();
        delete bookmarks[key];
        this.save();
    }

    contains(key: string) {
        const bookmarks = this.getAll();
        return key in bookmarks;
    }
}

const bookmarks = new BookmarkService();

export { bookmarks as Bookmarks };