export type BookmarkKey = string | number | Array<string | number>;

export type Bookmark<TProps> = {
    widget: string;
    props: TProps;
}

export type ItemBookmark = {
    device: string;
    deviceName: string;
    id: string;
    title: string;
}

export type DeviceBookmark = {
    category: string;
    device: string;
    name: string;
    description: string;
    icon: string;
}

export interface BookmarkStore<TKey extends BookmarkKey, TProps> extends ExternalStore<Bookmark<TProps>[]> {
    get(key: TKey): Promise<Bookmark<TProps>>;
    getAll(): Promise<Bookmark<TProps>[]>;
    add(widgetName: string, props: TProps): Promise<IDBValidKey>;
    remove(key: TKey): Promise<void>;
    clear(): Promise<void>;
    contains(key: TKey): Promise<boolean>;
}

export interface BookmarkStoreFactory {
    <TKey extends BookmarkKey, TProps>(store: string): BookmarkStore<TKey, TProps>
}