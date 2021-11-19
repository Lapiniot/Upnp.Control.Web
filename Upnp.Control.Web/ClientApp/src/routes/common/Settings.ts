type TypedSettings = {
    pageSize: number;
    readonly pageSizes: number[];
    timeout: number;
    containerScanTimeout: number;
    containerScanDepth: number;
    useDlnaProxy: boolean;
    showDiscoveryNotifications: boolean;
    showPlaybackNotifications: boolean;
}

const defaults: TypedSettings = {
    pageSize: 60,
    pageSizes: [15, 30, 60, 120, 150],
    timeout: 5000,
    containerScanTimeout: 15000,
    containerScanDepth: 3,
    useDlnaProxy: true,
    showDiscoveryNotifications: true,
    showPlaybackNotifications: false
};

export type BookmarkGroup = "devices" | "playlists" | "items";

const homeDefaults: { expandSection: BookmarkGroup | "" } = {
    expandSection: "devices"
}

export class Settings<T extends { [P: string]: string | number | boolean | object }> {

    private defaults: T;
    private section: string;

    constructor(section: string, defaults: T) {
        this.section = section;
        this.defaults = defaults;
    }

    public get<K extends keyof T, V extends T[K]>(key: K): V {
        const def = this.defaults[key];
        const str = localStorage.getItem(`${this.section}:${key}`);

        if (str !== null) {
            switch (typeof def) {
                case "string": return str as V;
                case "number": return parseInt(str) as V;
                case "boolean": return !!parseInt(str) as V;
                case "object": return JSON.parse(str) as V;
            }
        }
        return def as V;
    }

    public set<K extends keyof T, V extends T[K]>(key: K, value: V): void {
        const name = this.section + ":" + key;
        switch (typeof value) {
            case "object": localStorage.setItem(name, JSON.stringify(value)); break;
            case "boolean": localStorage.setItem(name, value ? "1" : "0"); break;
            default: localStorage.setItem(name, value.toString()); break;
        }
    }

    public remove<K extends keyof T>(key: K): void {
        const name = this.section + ":" + key;
        localStorage.removeItem(name);
    }
}

const settings = new Settings("global", defaults);
const profile = { home: new Settings("home", homeDefaults) };

export default settings;
export { profile };