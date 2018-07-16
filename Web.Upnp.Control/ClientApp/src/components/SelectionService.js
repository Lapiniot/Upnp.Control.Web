
export class SelectionService {
    constructor() {
        this.map = new Map();
    }

    any = () => this.map.size > 0;

    select = (key, state = true) => {
        if (state)
            this.map.set(key, true);
        else
            this.map.delete(key);
    };

    selectMany = (keys, state) => keys.forEach(k => this.select(k, state));

    selected = key => this.map.has(key) && this.map.get(key);

    all = keys => keys.every(this.selected);

    selection = () => this.map.keys();

    clear = () => this.map.clear();
}