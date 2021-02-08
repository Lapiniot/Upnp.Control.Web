const STORAGE_KEY = "bookmarks";

export class BookmarkService {
    static add(key: string, widgetName: string, props?: {}) {
        const data = localStorage.getItem(STORAGE_KEY);
        const bookmarks = data ? JSON.parse(data) : {};
        bookmarks[key] = { "widget": widgetName, "props": props };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }

    static remove(key: string) {
        const data = localStorage.getItem(STORAGE_KEY);
        const bookmarks = data ? JSON.parse(data) : {};
        delete bookmarks[key];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }

    static contains(key: string) {
        const data = localStorage.getItem(STORAGE_KEY);
        const bookmarks = data ? JSON.parse(data) : {};
        return key in bookmarks;
    }
}