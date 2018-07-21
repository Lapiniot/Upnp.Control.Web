
export default class SelectionService {
    constructor() {
        this.map = new Map();
    }

    any = () => { return this.map.size > 0; }

    select = (key, state = true) => {
        if (state)
            this.map.set(key, true);
        else
            this.map.delete(key);
    };

    selectMany = (keys, state) => keys.forEach(k => { return this.select(k, state); });

    selected = key => { return this.map.has(key) && this.map.get(key); };

    all = keys => keys.every(i => { return this.selected(i); });

    get selection() { return this.map.keys(); };

    clear = () => { return this.map.clear(); };
}