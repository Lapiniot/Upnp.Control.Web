export default class SelectionService extends EventTarget {
    constructor() {
        super();
        this.map = new Map();
    }

    static createEvent = detail => new CustomEvent("changed", { detail: detail, cancelable: true });

    any = () => { return this.map.size > 0; }

    one = () => { return this.map.size === 1; }

    none = () => { return this.map.size === 0; }

    select = (key, state = true, detail = null) => {
        state ? this.map.set(key, true) : this.map.delete(key);
        return this.dispatchEvent(SelectionService.createEvent(detail));
    };

    selectMany = (keys, state = true, detail = null) => {
        keys.forEach(state ? key => this.map.set(key, true) : key => this.map.delete(key));
        return this.dispatchEvent(SelectionService.createEvent(detail));
    };

    selected = key => { return this.map.has(key) && this.map.get(key); }

    all = keys => { return keys.length > 0 && keys.every(this.selected); }

    clear = detail => {
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