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

export class SelectionTracker {
    private items: string[];
    private store: SelectionStore;
    private focus: string | null = null;
    private onchanged: (ids: string[], hint: EventHint, handled: boolean) => void;

    constructor(selectables: string[], store: SelectionStore, onChanged: (ids: string[], hint: EventHint, handled: boolean) => void) {
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

    get focused() {
        return this.focus;
    }

    blur() {
        this.focus = null;
    }

    setup(selectables?: string[], selection?: SelectionStore) {
        this.items = selectables ?? this.items;
        this.store = selection ?? this.store;
    }

    selectFirst(hint?: EventHint) {
        if (this.enabled()) {
            this.selectOnly(0, hint);
        }
    }

    selectLast(hint?: EventHint) {
        if (this.enabled()) {
            this.selectOnly(this.items.length - 1, hint);
        }
    }

    selectNext(hint?: EventHint) {
        if (this.enabled()) {
            this.selectOnly(this.focus ? this.items.indexOf(this.focus) + 1 : 0, hint);
        }
    }

    selectPrev(hint?: EventHint) {
        if (this.enabled()) {
            this.selectOnly(this.focus ? this.items.indexOf(this.focus) - 1 : this.items.length - 1, hint)
        }
    }

    setOnly(id: string, state: boolean, hint?: EventHint) {
        if (this.enabled()) {
            if (this.store.one() && this.store.selected(id) === state) return;
            this.store.reset();
            this.onchanged([id], hint ?? EventHint.None, this.store.select(id, state));
            this.focus = state ? id : null;
        }
    }

    set(id: string, state: boolean, hint?: EventHint) {
        if (this.enabled()) {
            if (this.store.one() && this.store.selected(id) === state) return;
            this.onchanged([id], hint ?? EventHint.None, this.store.select(id, state));
            this.focus = state ? id : this.focus;
        }
    }

    toggle(id: string, hint?: EventHint) {
        if (this.enabled()) {
            const state = !this.store.selected(id);
            this.onchanged([id], hint ?? EventHint.None, this.store.select(id, state));
            this.focus = state ? id : null;
        }
    }

    setAll(state: boolean, hint?: EventHint) {
        if (this.enabled()) {
            this.onchanged(this.items, hint ?? EventHint.None, state ? this.store.selectMany(this.items, true) : this.store.clear());
            this.focus = state ? this.items[this.items.length - 1] : null;
        }
    }

    expandTo(id: string, hint?: EventHint) {
        if (this.enabled()) {
            if (!this.focus) {
                this.set(id, true, hint);
                return;
            }

            const current = this.items.indexOf(this.focus);
            const next = this.items.indexOf(id);
            const solidRange = this.findFirstInRange(false, Math.min(current, next), Math.max(current, next)) === undefined;
            const range = solidRange
                ? (next > current ? this.items.slice(current, next) : this.items.slice(next + 1, current + 1))
                : (next > current ? this.items.slice(current, next + 1) : this.items.slice(next, current + 1));
            this.onchanged(range, hint ?? EventHint.None, this.store.selectMany(range, !solidRange));
            this.focus = this.items[next];
        }
    }

    expandUp(hint?: EventHint) {
        if (this.enabled()) {

            if (!this.focus) {
                this.selectLast(hint);
                return;
            }

            const index = this.items.indexOf(this.focus) - 1;
            if (index >= 0) {
                if (!this.store.selected(this.items[index])) {
                    // previouse item is not selected - select it and move focus to the beginning of a new "solid" range
                    const next = this.findLastInRange(false, 0, index - 1);
                    this.select(index, true, hint);
                    this.focus = this.items[next !== undefined ? next + 1 : 0];
                }
                else {
                    // previouse item is already selected - unselect it and move focus one item up, "trimming" nearest range from the bottom
                    this.select(index + 1, false, hint);
                    this.focus = this.items[index];
                }
            }
        }
    }

    expandDown(hint?: EventHint) {
        if (this.enabled()) {

            if (!this.focus) {
                this.selectFirst(hint);
                return;
            }

            const index = this.items.indexOf(this.focus) + 1;
            if (index < this.items.length) {
                if (!this.store.selected(this.items[index])) {
                    // nex item is not selected - select it and move focus to the end of a new "solid" range
                    const next = this.findFirstInRange(false, index + 1, this.items.length);
                    this.select(index, true, hint);
                    this.focus = this.items[next !== undefined ? next - 1 : this.items.length - 1];
                }
                else {
                    // next item is already selected - unselect it and move focus one item down, "trimming" nearest range from the top
                    this.select(index - 1, false, hint);
                    this.focus = this.items[index];
                }
            }
        }
    }

    private selectOnly(index: number, hint?: EventHint) {
        if (index >= 0 && index < this.items.length) {
            this.store.reset();
            const item = this.items[index];
            this.onchanged([item], hint ?? EventHint.None, this.store.select(item, true));
            this.focus = item;
        }
    }

    private select(index: number, state: boolean, hint?: EventHint) {
        if (index >= 0 && index < this.items.length) {
            const item = this.items[index];
            this.onchanged([item], hint ?? EventHint.None, this.store.select(item, state));
            this.focus = item;
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