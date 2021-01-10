export enum EventHint {
    None,
    Keyboard = 0b01,
    Mouse = 0b10,
    Any = Keyboard | Mouse
}

interface SelectionStore {
    all: (items: string[]) => boolean;
    one: () => boolean;
    selected: (id: string) => boolean | undefined;
    reset: () => void;
    select: (id: string, state: boolean) => boolean;
    selectMany: (ids: string[], state: boolean) => boolean;
    clear: () => boolean;
}

type SelectionChangedCallback = (ids: string[], focused: string | null, hint: EventHint, handled: boolean) => void;

export class SelectionTracker {
    private items: string[];
    private store: SelectionStore;
    private current: string | null = null;
    private onchanged: SelectionChangedCallback;

    constructor(selectables: string[], store: SelectionStore, onChanged: SelectionChangedCallback) {
        this.items = selectables;
        this.store = store;
        this.onchanged = onChanged;
    }

    enabled() {
        return this.items.length > 0;
    }

    allSelected() {
        return this.store.all(this.items);
    }

    blur() {
        this.current = null;
    }

    get focus() {
        return this.current;
    }

    clear(hint?: EventHint) {
        if (!this.enabled()) return;
        this.onchanged([], this.current = null, hint ?? EventHint.None, this.store.clear());
    }

    setup(selectables?: string[], selection?: SelectionStore) {
        this.items = selectables ?? this.items;
        this.store = selection ?? this.store;
    }

    selectFirst(hint?: EventHint) {
        if (!this.enabled()) return;
        this.selectOnly(0, hint);
    }

    selectLast(hint?: EventHint) {
        if (!this.enabled()) return;
        this.selectOnly(this.items.length - 1, hint);
    }

    moveNext(hint?: EventHint) {
        if (!this.enabled()) return;
        this.selectOnly(this.current ? this.items.indexOf(this.current) + 1 : 0, hint);
    }

    movePrev(hint?: EventHint) {
        if (!this.enabled()) return;
        this.selectOnly(this.current ? this.items.indexOf(this.current) - 1 : this.items.length - 1, hint)
    }

    setOnly(id: string, hint?: EventHint) {
        if (!this.enabled() || this.store.one() && this.store.selected(id)) return;
        this.store.reset();
        this.onchanged([id], this.current = id, hint ?? EventHint.None, this.store.select(id, true));
    }

    set(id: string, state: boolean, hint?: EventHint) {
        if (!this.enabled()) return;
        if (this.store.one() && this.store.selected(id) === state) return;
        this.onchanged([id], this.current = state ? id : this.current, hint ?? EventHint.None, this.store.select(id, state));
    }

    toggle(id: string, hint?: EventHint) {
        if (!this.enabled()) return;
        const state = !this.store.selected(id);
        this.onchanged([id], this.current = state ? id : null, hint ?? EventHint.None, this.store.select(id, state));
    }

    setAll(state: boolean, hint?: EventHint) {
        if (!this.enabled()) return;
        this.onchanged(this.items, this.current = state ? this.items[this.items.length - 1] : null,
            hint ?? EventHint.None, state ? this.store.selectMany(this.items, true) : this.store.clear());
    }

    expandTo(id: string, hint?: EventHint) {
        if (!this.enabled()) return;
        if (!this.current) {
            this.set(id, true, hint);
            return;
        }

        const current = this.items.indexOf(this.current);
        const next = this.items.indexOf(id);
        const solidRange = this.findFirstInRange(false, Math.min(current, next), Math.max(current, next)) === undefined;
        const range = solidRange
            ? (next > current ? this.items.slice(current, next) : this.items.slice(next + 1, current + 1))
            : (next > current ? this.items.slice(current, next + 1) : this.items.slice(next, current + 1));

        this.onchanged(range, this.current = this.items[next], hint ?? EventHint.None, this.store.selectMany(range, !solidRange));
    }

    expandUp(hint?: EventHint) {
        if (!this.enabled()) return;
        if (!this.current) {
            this.selectLast(hint);
            return;
        }

        const index = this.items.indexOf(this.current) - 1;
        if (index >= 0) {
            if (!this.store.selected(this.items[index])) {
                // previouse item is not selected - select it and move focus to the beginning of a new "solid" range
                const next = this.findLastInRange(false, 0, index - 1);
                this.select(index, this.current = this.items[next !== undefined ? next + 1 : 0], true, hint);
            }
            else {
                // previouse item is already selected - unselect it and move focus one item up, "trimming" nearest range from the bottom
                this.select(index + 1, this.current = this.items[index], false, hint);
            }
        }
    }

    expandDown(hint?: EventHint) {
        if (!this.enabled()) return;

        if (!this.current) {
            this.selectFirst(hint);
            return;
        }

        const index = this.items.indexOf(this.current) + 1;
        if (index < this.items.length) {
            if (!this.store.selected(this.items[index])) {
                // nex item is not selected - select it and move focus to the end of a new "solid" range
                const next = this.findFirstInRange(false, index + 1, this.items.length);
                this.select(index, this.current = this.items[next !== undefined ? next - 1 : this.items.length - 1], true, hint);
            }
            else {
                // next item is already selected - unselect it and move focus one item down, "trimming" nearest range from the top
                this.select(index - 1, this.current = this.items[index], false, hint);
            }
        }
    }

    private selectOnly(index: number, hint?: EventHint) {
        if (index >= 0 && index < this.items.length) {
            this.store.reset();
            const item = this.items[index];
            this.onchanged([item], this.current = item, hint ?? EventHint.None, this.store.select(item, true));
        }
    }

    private select(index: number, focused: string, state: boolean, hint?: EventHint) {
        if (index >= 0 && index < this.items.length) {
            const item = this.items[index];
            this.onchanged([item], focused, hint ?? EventHint.None, this.store.select(item, state));
        }
    }

    private findFirstInRange(state: boolean, start: number, end: number) {
        const { items, store: { selected } } = this;
        for (let index = start; index <= end; index++) {
            if (selected(items[index]) === state) {
                return index;
            }
        }
    }

    private findLastInRange(state: boolean, start: number, end: number) {
        const { items, store: { selected } } = this;
        for (let index = end; index >= start; index--) {
            if (selected(items[index]) === state) {
                return index;
            }
        }
    }
}