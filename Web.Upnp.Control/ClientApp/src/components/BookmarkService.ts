import { Database } from "./Database";

const DB_NAME = "bookmarks";
const DB_VERSION = 1;

function databaseMigrate(this: IDBOpenDBRequest, e: IDBVersionChangeEvent) {
    if (e.newVersion === 1) {
        this.result.createObjectStore("devices", { keyPath: ["props.category", "props.device"] })
    }
}

class BookmarkService<TKey extends string | number | Array<string | number>, TProps = {}> {
    storeName: string;
    db: Database | null = null;

    constructor(group: string) {
        this.storeName = group;
    }

    private async open() {
        return await Database.open(DB_NAME, DB_VERSION, databaseMigrate);
    }

    private store(database: Database) {
        return database.transaction([this.storeName], "readwrite").store(this.storeName);
    }

    async getAll(): Promise<{ widget: string, props: TProps }[]> {
        this.db = this.db ?? await this.open();
        return await this.store(this.db).getAll() as unknown as { widget: string, props: TProps }[];
    }

    async add(widgetName: string, props: TProps) {
        this.db = this.db ?? await this.open();
        return await this.store(this.db).add({ widget: widgetName, props });
    }

    async remove(key: TKey) {
        this.db = this.db ?? await this.open();
        return await this.store(this.db).delete(key);
    }

    async contains(key: TKey) {
        this.db = this.db ?? await this.open();
        return await this.store(this.db).count(key) > 0;
    }
}

const devices = new BookmarkService<[string, string],
    { category: string, device: string, [key: string]: any }>("devices");

export { devices as DeviceBookmarks };