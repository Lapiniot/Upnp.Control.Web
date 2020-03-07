export default class {
    constructor() {
        this.map = new Map();
    }

    any = () => this.map.size > 0;

    one = () => this.map.size === 1;

    select = (key, state = true) => state ? this.map.set(key, true) : this.map.delete(key);

    selectMany = (keys, state = true) => keys.forEach(state ? key => this.map.set(key, true) : key => this.map.delete(key));

    selected = key => this.map.has(key) && this.map.get(key);

    all = keys => keys.length > 0 && keys.every(keys => this.selected(keys));

    clear = () => this.map.clear();

    get keys() {
        return this.map.keys();
    }
}