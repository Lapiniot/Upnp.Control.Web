import { Database } from "../../services/Database";
import { ExternalStoreBase } from "../../services/ExternalStoreBase";
import type { Bookmark, BookmarkKey, BookmarkStore, BookmarkStoreFactory, DeviceBookmark, ItemBookmark } from "./BookmarkStore";

const DB_NAME = "bookmarks";
const DB_VERSION = 1;

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

class IndexedDBBookmarkStore<TKey extends BookmarkKey, TProps>
    extends ExternalStoreBase<Bookmark<TProps>[]>
    implements BookmarkStore<TKey, TProps> {

    private storeName: string;
    private db: Database | null = null;
    private snapshot!: Bookmark<TProps>[];

    constructor(group: string) {
        super();
        this.storeName = group;
        this.update();
    }

    public get = async (key: TKey): Promise<Bookmark<TProps>> => {
        this.db = this.db ?? await this.open();
        return await this.store(this.db, "readonly").get(key) as Bookmark<TProps>;
    };

    public getAll = async (): Promise<Bookmark<TProps>[]> => {
        this.db = this.db ?? await this.open();
        return await this.store(this.db, "readonly").getAll() as Bookmark<TProps>[];
    };

    public add = async (widgetName: string, props: TProps): Promise<TKey> => {
        this.db = this.db ?? await this.open();
        const key = await this.store(this.db, "readwrite").add({ widget: widgetName, props });
        await this.update();
        return key as TKey;
    };

    public remove = async (key: TKey): Promise<void> => {
        this.db = this.db ?? await this.open();
        await this.store(this.db, "readwrite").delete(key);
        await this.update();
    };

    public clear = async (): Promise<void> => {
        this.db = this.db ?? await this.open();
        await this.store(this.db, "readwrite").clear();
        await this.update();
    };

    public contains = async (key: TKey): Promise<boolean> => {
        this.db = this.db ?? await this.open();
        return await this.store(this.db, "readonly").count(key) > 0;
    };

    public getSnapshot = (): Bookmark<TProps>[] => this.snapshot;

    private async open() {
        return await Database.open(DB_NAME, DB_VERSION, databaseMigrate);
    }

    private store(database: Database, mode: "readonly" | "readwrite") {
        return database.transaction([this.storeName], mode).store(this.storeName);
    }

    private async update() {
        this.snapshot = await this.getAll();
        this.notifyUpdated();
    }
}

export default <BookmarkStoreFactory>function Create<TKey extends BookmarkKey, TProps>(store: string) {
    return new IndexedDBBookmarkStore<TKey, TProps>(store);
}

const deviceBookmarks: BookmarkStore<[string, string], DeviceBookmark> =
    new IndexedDBBookmarkStore<[string, string], DeviceBookmark>("devices");
const itemBookmarks: BookmarkStore<[string, string], ItemBookmark> =
    new IndexedDBBookmarkStore<[string, string], ItemBookmark>("items");
const playlistBookmarks: BookmarkStore<[string, string], ItemBookmark> =
    new IndexedDBBookmarkStore<[string, string], ItemBookmark>("playlists");

export { deviceBookmarks, itemBookmarks, playlistBookmarks, type BookmarkStore }
