function promisify<T>(request: IDBRequest<T>) {
    return new Promise<T>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export class Database {
    private db: IDBDatabase;

    private constructor(database: IDBDatabase) {
        this.db = database;
    }

    static open(name: string, version: number, upgradeHandler?: (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => unknown) {
        return new Promise<Database>((resolve, reject) => {
            const request = indexedDB.open(name, version);
            if (upgradeHandler) {
                request.onupgradeneeded = upgradeHandler;
            }
            request.onsuccess = () => {
                resolve(new Database(request.result))
            }
            request.onerror = () => {
                reject(request.error)
            }
        });
    }

    close() {
        this.db.close();
    }

    transaction(storeNames: string | Iterable<string>, mode?: IDBTransactionMode) {
        return new DbTransaction(this.db.transaction(storeNames, mode));
    }
}

export class DbTransaction {
    private transaction: IDBTransaction;

    constructor(transaction: IDBTransaction) {
        this.transaction = transaction;
    }

    get storeNames() {
        return this.transaction.objectStoreNames;
    }

    abort() {
        this.transaction.abort();
    }

    store<T>(name: string) {
        return new DbStoreScoped<T>(this.transaction.objectStore(name));
    }
}

export class DbStoreScoped<T> {
    private store: IDBObjectStore;

    get name() {
        return this.store.name;
    }

    constructor(store: IDBObjectStore) {
        this.store = store;
    }

    count(key?: IDBValidKey | IDBKeyRange) {
        return promisify(this.store.count(key));
    }

    get(query: IDBValidKey | IDBKeyRange) {
        return promisify(this.store.get(query));
    }

    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number) {
        return promisify(this.store.getAll(query, count));
    }

    getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number) {
        return promisify(this.store.getAllKeys(query, count));
    }

    add(value: T, key?: IDBValidKey) {
        return promisify(this.store.add(value, key));
    }

    put(value: T, key?: IDBValidKey) {
        return promisify(this.store.put(value, key));
    }

    delete(key: IDBValidKey) {
        return promisify(this.store.delete(key))
    }

    clear() {
        return promisify(this.store.clear());
    }
}