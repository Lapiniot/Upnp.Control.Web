export default class {
    constructor() {
        this.map = new Map();
    }

    any = () => {
        return this.map.size > 0;
    }

    one = () => {
        return this.map.size === 1;
    }

    select = (key, state = true) => {
        if (state)
            this.map.set(key, true);
        else
            this.map.delete(key);
    };

    selectMany = (keys, state = true) => {
        const action = state ?
            key => this.map.set(key, true) :
            key => this.map.delete(key);

        keys.forEach(action);
    };

    selected = key => {
        return this.map.has(key) && this.map.get(key);
    };

    all = keys => {
        return keys.every(keys => {
            return this.selected(keys);
        });
    }

    get selection() {
        return this.map.keys();
    }

    clear = () => {
        this.map.clear();
    };
}