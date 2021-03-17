import { RowState } from "./Types";

const empty: number[] = [];

export enum EventHint {
    None,
    Keyboard = 0b01,
    Mouse = 0b10,
    Any = Keyboard | Mouse
}

type SelectionChangedCallback = (indeeces: number[], focused: number | null, hint: EventHint) => void;

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

    selectFirst(hint?: EventHint) {
        if (!this.enabled()) return;
        this.setOnly(0, hint);
    }

    selectLast(hint?: EventHint) {
        if (!this.enabled()) return;
        this.setOnly(this.states.length - 1, hint);
    }

    moveNext(hint?: EventHint) {
        this.setOnly(this.current !== null ? this.current + 1 : 0, hint);
    }

    movePrev(hint?: EventHint) {
        this.setOnly(this.current !== null ? this.current - 1 : this.states.length - 1, hint)
    }

    setOnly(index: number, hint?: EventHint) {
        if (!this.enabled() || index < 0 || index >= this.states.length) return;
        this.reset();
        this.states[index] |= RowState.Selected;
        this.onchanged(this.states[index] & RowState.Selectable ? [index] : empty, this.current = index, hint ?? EventHint.None);
    }

    set(index: number, state: boolean, hint?: EventHint) {
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
        this.onchanged(this.getSelectionIndeeces(), this.current, hint ?? EventHint.None);
    }

    toggle(index: number, hint?: EventHint) {
        if (!this.enabled() || index < 0 || index >= this.states.length) return;
        this.states[index] ^= RowState.Selected;
        this.onchanged(this.getSelectionIndeeces(),
            this.states[index] & RowState.Selected ? (this.current = index) : (this.current === index ? (this.current = null) : this.current),
            hint ?? EventHint.None);
    }

    setAll(state: boolean, hint?: EventHint) {
        if (!this.enabled()) return;
        if (state) {
            const selection = [];
            for (let i = 0; i < this.states.length; i++) {
                this.states[i] |= RowState.Selected;
                if (this.states[i] & RowState.Selectable)
                    selection.push(i);
            }
            this.onchanged(selection, this.current = this.states.length - 1, hint ?? EventHint.None);
        }
        else {
            this.reset();
            this.onchanged(empty, null, hint ?? EventHint.None);
        }
    }

    expandTo(index: number, hint?: EventHint) {
        if (!this.enabled() || index < 0 || index >= this.states.length) return;

        if (this.current === null) {
            this.set(index, true, hint);
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

        this.onchanged(this.getSelectionIndeeces(), this.current = index, hint ?? EventHint.None);
    }

    expandUp(hint?: EventHint) {
        if (!this.enabled()) return;

        if (this.current === null) {
            this.selectLast(hint);
            return;
        }

        const index = this.current - 1;
        if (index >= 0) {
            if (!(this.states[index] & RowState.Selected)) {
                // previouse item is not selected - select it and move focus to the beginning of a new "solid" range
                const next = this.findLastInRange(false, 0, index - 1);
                this.states[index] |= RowState.Selected;
                this.onchanged(this.getSelectionIndeeces(), this.current = next !== undefined ? next + 1 : 0, hint ?? EventHint.None);
            }
            else {
                // previouse item is already selected - unselect it and move focus one item up, "trimming" nearest range from the bottom
                this.states[index + 1] &= ~RowState.Selected;
                this.onchanged(this.getSelectionIndeeces(), this.current = index, hint ?? EventHint.None);
            }
        }
    }

    expandDown(hint?: EventHint) {
        if (!this.enabled()) return;

        if (this.current === null) {
            this.selectFirst(hint);
            return;
        }

        const index = this.current + 1;
        if (index < this.states.length) {
            if (!(this.states[index] & RowState.Selected)) {
                // nex item is not selected - select it and move focus to the end of a new "solid" range
                const next = this.findFirstInRange(false, index + 1, this.states.length);
                this.states[index] |= RowState.Selected;
                this.onchanged(this.getSelectionIndeeces(), this.current = next !== undefined ? next - 1 : this.states.length - 1, hint ?? EventHint.None);
            }
            else {
                // next item is already selected - unselect it and move focus one item down, "trimming" nearest range from the top
                this.states[index - 1] &= ~RowState.Selected;
                this.onchanged(this.getSelectionIndeeces(), this.current = index, hint ?? EventHint.None);
            }
        }
    }

    private reset() {
        for (let i = 0; i < this.states.length; i++) {
            this.states[i] &= ~RowState.Selected;
        }
    }

    private getSelectionIndeeces() {
        const selection = [];
        for (let i = 0; i < this.states.length; i++) {
            if (this.states[i] & RowState.Selected)
                selection.push(i);
        }
        return selection;
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