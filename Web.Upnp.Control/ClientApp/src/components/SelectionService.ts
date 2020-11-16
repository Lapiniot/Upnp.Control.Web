export default class SelectionService extends EventTarget {

    map = new Map<string, boolean>();

    static createEvent = (detail: any) => new CustomEvent("changed", { detail: detail, cancelable: true });

    any = () => { return this.map.size > 0; }

    one = () => { return this.map.size === 1; }

    none = () => { return this.map.size === 0; }

    select = (key: string, state = true, detail = null) => {
        state ? this.map.set(key, true) : this.map.delete(key);
        return this.dispatchEvent(SelectionService.createEvent(detail));
    };

    selectMany = (keys: string[], state = true, detail = null) => {
        keys.forEach(state ? key => this.map.set(key, true) : key => this.map.delete(key));
        return this.dispatchEvent(SelectionService.createEvent(detail));
    };

    selected = (key: string) => { return this.map.has(key) && this.map.get(key); }

    all = (keys: string[]) => { return keys.length > 0 && keys.every(this.selected); }

    clear = (detail: any) => {
        this.map.clear();
        return this.dispatchEvent(SelectionService.createEvent(detail));
    };

    reset = () => { this.map.clear(); }

    get keys() {
        return this.map.keys();
    }

    get length() {
        return this.map.size;
    }
}