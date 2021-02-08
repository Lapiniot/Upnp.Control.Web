const STORAGE_KEY = "bookmarks";

type Bookmark = { widget: string, "props": any };
type BookmarkMap = { [key: string]: Bookmark };

class BookmarkService {

    getAll(): BookmarkMap {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }

    add(key: string, widgetName: string, props?: {}) {
        const bookmarks = this.getAll();
        bookmarks[key] = { "widget": widgetName, "props": props };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }

    remove(key: string) {
        const bookmarks = this.getAll();
        delete bookmarks[key];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }

    contains(key: string) {
        const bookmarks = this.getAll();
        return key in bookmarks;
    }
}

const bookmarks = new BookmarkService();

export { bookmarks as Bookmarks };