export default class SelectionService extends EventTarget {
    constructor() {
        super();
        this.map = new Map();
    }

    static createEvent = (detail) => {
        return new CustomEvent('changed', { detail: detail, cancelable: true });
    }

    any = () => this.map.size > 0;

    one = () => this.map.size === 1;

    none = () => this.map.size === 0;

    select = (key, state = true, detail = null) => {
        state ? this.map.set(key, true) : this.map.delete(key);
        return this.dispatchEvent(SelectionService.createEvent(detail));
    }

    selectMany = (keys, state = true, detail = null) => {
        keys.forEach(state ? key => this.map.set(key, true) : key => this.map.delete(key));
        return this.dispatchEvent(SelectionService.createEvent(detail));
    }

    selected = key => this.map.has(key) && this.map.get(key);

    all = keys => keys.length > 0 && keys.every(keys => this.selected(keys));

    clear = (detail) => {
        this.map.clear();
        return this.dispatchEvent(SelectionService.createEvent(detail));
    }

    get keys() {
        return this.map.keys();
    }

    get length() {
        return this.map.size;
    }
}