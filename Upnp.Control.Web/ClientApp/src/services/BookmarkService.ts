import { Database } from "./Database";

const DB_NAME = "bookmarks";
const DB_VERSION = 1;

type WidgetProps<T = object> = T & { [index: string]: any };

function databaseMigrate(this: IDBOpenDBRequest, { newVersion }: IDBVersionChangeEvent) {
    const { result: db } = this;
    if (newVersion === 1) {
        db.createObjectStore("devices", { keyPath: ["props.category", "props.device"] });
        db.createObjectStore("items", { keyPath: ["props.device", "props.id"] }).
            createIndex("device", ["props.device"]);
        db.createObjectStore("playlists", { keyPath: ["props.device", "props.id"] }).
            createIndex("device", ["props.device"]);
    }
}

type BookmarkKey = string | number | Array<string | number>;

export interface IBookmarkStore<TKey extends BookmarkKey, TProps = {}> {
    getAll(): Promise<{ widget: string, props: TProps }[]>;
    add(widgetName: string, props: TProps): Promise<IDBValidKey>;
    remove(key: TKey): Promise<undefined>;
    contains(key: TKey): Promise<boolean>;
}

export class BookmarkService<TKey extends BookmarkKey = any, TProps = {}> implements IBookmarkStore<TKey, TProps> {
    storeName: string;
    db: Database | null = null;

    constructor(group: string) {
        this.storeName = group;
    }

    private async open() {
        return await Database.open(DB_NAME, DB_VERSION, databaseMigrate);
    }

    private store(database: Database, mode: "readonly" | "readwrite") {
        return database.transaction([this.storeName], mode).store(this.storeName);
    }

    getAll = async (): Promise<{ widget: string, props: TProps }[]> => {
        this.db = this.db ?? await this.open();
        return await this.store(this.db, "readonly").getAll() as unknown as { widget: string, props: TProps }[];
    }

    add = async (widgetName: string, props: TProps) => {
        this.db = this.db ?? await this.open();
        return await this.store(this.db, "readwrite").add({ widget: widgetName, props });
    }

    remove = async (key: TKey) => {
        this.db = this.db ?? await this.open();
        return await this.store(this.db, "readwrite").delete(key);
    }

    clear = async () => {
        this.db = this.db ?? await this.open();
        return await this.store(this.db, "readwrite").clear();
    }

    contains = async (key: TKey) => {
        this.db = this.db ?? await this.open();
        return await this.store(this.db, "readonly").count(key) > 0;
    }
}

const deviceBookmarks = new BookmarkService<[string, string], WidgetProps<{ category: string, device: string }>>("devices");
const itemBookmarks = new BookmarkService<[string, string], WidgetProps<{ device: string, deviceName: string, id: string, title: string }>>("items");
const playlistBookmarks = new BookmarkService<[string, string], WidgetProps<{ device: string, deviceName: string, id: string, title: string }>>("playlists");

export { deviceBookmarks, itemBookmarks, playlistBookmarks };

export async function getBookmarkData() {
    return {
        devices: await deviceBookmarks.getAll(),
        items: await itemBookmarks.getAll(),
        playlists: await playlistBookmarks.getAll()
    };
}