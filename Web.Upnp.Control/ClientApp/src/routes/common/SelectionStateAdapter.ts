import { RowState } from "./Types";

type SelectionChangedCallback = (focused: number | null) => void;

export class SelectionStateAdapter {
    private states: RowState[];
    private current: number | null = null;
    private onchanged: SelectionChangedCallback;

    constructor(states: RowState[], current: number | null, onChanged: SelectionChangedCallback) {
        this.states = states;
        if (current != null && (current < 0 || current >= states.length))
            throw new Error("Invalid value for 'current' parameter. Index is out of 'states' array range.");
        this.current = current;
        this.onchanged = onChanged;
    }

    enabled() {
        return this.states.length > 0;
    }

    allSelected() {
        return !this.states.some(state => (state & RowState.SelectMask) === RowState.Selectable)
    }

    get focus() {
        return this.current;
    }

    selectFirst() {
        if (!this.enabled()) return;
        this.setOnly(0);
    }

    selectLast() {
        if (!this.enabled()) return;
        this.setOnly(this.states.length - 1);
    }

    moveNext() {
        this.setOnly(this.current !== null ? this.current + 1 : 0);
    }

    movePrev() {
        this.setOnly(this.current !== null ? this.current - 1 : this.states.length - 1)
    }

    setOnly(index: number) {
        if (!this.enabled() || index < 0 || index >= this.states.length) return;
        this.reset();
        this.states[index] |= RowState.Selected;
        this.onchanged(this.current = index);
    }

    set(index: number, state: boolean) {
        if (!this.enabled() || index < 0 || index >= this.states.length) return;
        if (state) {
            this.states[index] |= RowState.Selected;
            this.current = index;
        }
        else {
            this.states[index] &= ~RowState.Selected;
            if (index === this.current)
                this.current = null;
        }
        this.onchanged(this.current);
    }

    toggle(index: number) {
        if (!this.enabled() || index < 0 || index >= this.states.length) return;
        this.states[index] ^= RowState.Selected;
        this.onchanged(this.states[index] & RowState.Selected
            ? (this.current = index)
            : (this.current === index ? (this.current = null) : this.current));
    }

    setAll(state: boolean) {
        if (!this.enabled()) return;
        if (state) {
            this.onchanged(this.current = this.states.length - 1);
        }
        else {
            this.reset();
            this.onchanged(null);
        }
    }

    expandTo(index: number) {
        if (!this.enabled() || index < 0 || index >= this.states.length) return;

        if (this.current === null) {
            this.set(index, true);
            return;
        }

        const current = this.current;
        const start = Math.min(current, index);
        const end = Math.max(current, index);
        const solidRange = this.findFirstInRange(false, start, end) === undefined;

        if (solidRange) {
            //trim selection
            if (index > current)
                for (let i = current; i < index; i++) this.states[i] &= ~RowState.Selected;
            else
                for (let i = index + 1; i <= current; i++) this.states[i] &= ~RowState.Selected;
        }
        else {
            // expand selection
            for (let i = start; i <= end; i++) this.states[i] |= RowState.Selected;
        }

        this.onchanged(this.current = index);
    }

    expandUp() {
        if (!this.enabled()) return;

        if (this.current === null) {
            this.selectLast();
            return;
        }

        const index = this.current - 1;
        if (index >= 0) {
            if (!(this.states[index] & RowState.Selected)) {
                // previouse item is not selected - select it and move focus to the beginning of a new "solid" range
                const next = this.findLastInRange(false, 0, index - 1);
                this.states[index] |= RowState.Selected;
                this.onchanged(this.current = next !== undefined ? next + 1 : 0);
            }
            else {
                // previouse item is already selected - unselect it and move focus one item up, "trimming" nearest range from the bottom
                this.states[index + 1] &= ~RowState.Selected;
                this.onchanged(this.current = index);
            }
        }
    }

    expandDown() {
        if (!this.enabled()) return;

        if (this.current === null) {
            this.selectFirst();
            return;
        }

        const index = this.current + 1;
        if (index < this.states.length) {
            if (!(this.states[index] & RowState.Selected)) {
                // nex item is not selected - select it and move focus to the end of a new "solid" range
                const next = this.findFirstInRange(false, index + 1, this.states.length);
                this.states[index] |= RowState.Selected;
                this.onchanged(this.current = next !== undefined ? next - 1 : this.states.length - 1);
            }
            else {
                // next item is already selected - unselect it and move focus one item down, "trimming" nearest range from the top
                this.states[index - 1] &= ~RowState.Selected;
                this.onchanged(this.current = index);
            }
        }
    }

    private reset() {
        for (let i = 0; i < this.states.length; i++) {
            this.states[i] &= ~RowState.Selected;
        }
    }

    private findFirstInRange(state: boolean, start: number, end: number) {
        for (let index = start; index <= end; index++) {
            if (!!(this.states[index] & RowState.Selected) === state) {
                return index;
            }
        }
    }

    private findLastInRange(state: boolean, start: number, end: number) {
        for (let index = end; index >= start; index--) {
            if (!!(this.states[index] & RowState.Selected) === state) {
                return index;
            }
        }
    }
}