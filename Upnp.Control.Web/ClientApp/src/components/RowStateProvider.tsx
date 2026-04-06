import { useMemo, useReducer, type PropsWithChildren } from "react";
import RowStateContext, { RowState, type RowStateAction, type RowStateMapperFunction } from "./RowStateContext";

const IndexOutOfRangeError = "'index' parameter value is out of range"
const InvalidDispatchActionError = "invalid dispatch action"

type RowStateProviderProps = PropsWithChildren<unknown> & {
    items: Upnp.DIDL.Item[] | undefined,
    mapper?: RowStateMapperFunction,
    enabled?: boolean
}

function getRowState() {
    return RowState.Selectable | RowState.Navigable;
}

function getInitialState({ items, mapper }: { items: Upnp.DIDL.Item[] | undefined, mapper: RowStateMapperFunction }): RowStateProviderState {
    return {
        items, mapper, current: undefined,
        states: items?.map((item, index) => mapper(item, index, undefined))
    }
}

function reducer(state: RowStateProviderState, action: RowStateAction): RowStateProviderState {
    switch (action.type) {
        case "INIT":
            return getInitialState(action.initial);
        case "TOGGLE":
            return toggle(state, action.index);
        case "TOGGLE_ALL":
            return setAll(state, !!state.states?.some(rs => (rs & RowState.SelectMask) === RowState.Selectable));
        case "SET":
            return set(state, action.index, action.selected);
        case "SET_ONLY":
            return setOnly(state, action.index);
        case "SET_ALL":
            return setAll(state, action.selected);
        case "PREV":
            return setOnly(state, Math.max(state.current !== undefined ? state.current - 1 : (state.states?.length ?? 0) - 1, 0))
        case "NEXT":
            return setOnly(state, Math.min(state.current !== undefined ? state.current + 1 : 0, (state.states?.length ?? 0) - 1))
        case "EXPAND_TO":
            return expandTo(state, action.index);
        case "EXPAND_DOWN":
            return expandDown(state);
        case "EXPAND_UP":
            return expandUp(state);
        case "SET_ACTIVE":
            return setActive(state, action.index);
        default: throw new Error(InvalidDispatchActionError);
    }
}

type RowStateProviderState = {
    items: Upnp.DIDL.Item[] | undefined,
    mapper: RowStateMapperFunction | undefined,
    states: RowState[] | undefined,
    current: number | undefined
}

function set(state: RowStateProviderState, index: number, selected: boolean): RowStateProviderState {
    if (index < 0 || !state.states || index >= state.states.length)
        throw new Error(IndexOutOfRangeError);

    const { states, current } = state;

    if (selected) {
        states[index] |= RowState.Selected;
    }
    else {
        states[index] &= ~RowState.Selected;
    }

    return { ...state, current: selected ? index : index === current ? undefined : current };
}

function toggle(state: RowStateProviderState, index: number): RowStateProviderState {
    if (!state.states) return state;

    const { states } = state;
    states[index] ^= RowState.Selected;
    const current = states[index] & RowState.Selected ? index :
        state.current === index ? undefined : state.current;
    return { ...state, current };
}

function setOnly(state: RowStateProviderState, index: number): RowStateProviderState {
    if (index < 0 || !state.states || index >= state.states.length)
        throw new Error(IndexOutOfRangeError);

    const { states } = state;

    for (let i = 0; i < states.length; i++) {
        states[i] &= ~RowState.Selected;
    }

    states[index] |= RowState.Selected;
    return { ...state, current: index };
}

function setAll(state: RowStateProviderState, selected: boolean): RowStateProviderState {
    if (!state.states) return state;
    const { states } = state;

    if (selected) {
        for (let i = 0; i < states.length; i++)
            states[i] |= RowState.Selected;
    }
    else {
        for (let i = 0; i < states.length; i++)
            states[i] &= ~RowState.Selected;
    }

    const current = selected ? states.length - 1 : undefined;
    return { ...state, current };
}

function expandTo(state: RowStateProviderState, index: number): RowStateProviderState {
    if (index < 0 || !state.states || index >= state.states.length)
        throw new Error(IndexOutOfRangeError);

    if (state.current === undefined) {
        return set(state, index, true);
    }

    const { states, current } = state;

    const start = Math.min(current, index);
    const end = Math.max(current, index);
    const solidRange = findFirstInRange(states, false, start, end) === undefined;

    if (solidRange) {
        //trim selection
        if (index > current)
            for (let i = current; i < index; i++)
                states[i] &= ~RowState.Selected;
        else
            for (let i = index + 1; i <= current; i++)
                states[i] &= ~RowState.Selected;
    }
    else {
        // expand selection
        for (let i = start; i <= end; i++)
            states[i] |= RowState.Selected;
    }

    return { ...state, current: index };
}

function expandDown(state: RowStateProviderState): RowStateProviderState {
    if (!state.states) return state;

    if (state.current === undefined) {
        return setOnly(state, 0);
    }

    const { states, current } = state;
    const index = current + 1;

    if (index < states.length) {
        if (!(states[index] & RowState.Selected)) {
            // nex item is not selected - select it and move focus to the end of a new "solid" range
            const next = findFirstInRange(states, false, index + 1, states.length);
            states[index] |= RowState.Selected;
            state.current = next !== undefined ? next - 1 : states.length - 1;
        }
        else {
            // next item is already selected - unselect it and move focus one item down, "trimming" nearest range from the top
            states[index - 1] &= ~RowState.Selected;
            state.current = index;
        }
    }

    return { ...state };
}

function expandUp(state: RowStateProviderState): RowStateProviderState {

    if (!state.states) return state;

    if (state.current === undefined) {
        return setOnly(state, state.states.length - 1);
    }

    const { states, current } = state;
    const index = current - 1;

    if (index >= 0) {
        if (!(states[index] & RowState.Selected)) {
            // previouse item is not selected - select it and move focus to the beginning of a new "solid" range
            const next = findLastInRange(states, false, 0, index - 1);
            states[index] |= RowState.Selected;
            state.current = next !== undefined ? next + 1 : 0;
        }
        else {
            // previouse item is already selected - unselect it and move focus one item up, "trimming" nearest range from the bottom
            states[index + 1] &= ~RowState.Selected;
            state.current = index;
        }
    }

    return { ...state };
}

function findFirstInRange(states: RowState[], state: boolean, start: number, end: number) {
    for (let index = start; index <= end; index++) {
        if (!!(states[index] & RowState.Selected) === state) {
            return index;
        }
    }
}

function findLastInRange(states: RowState[], state: boolean, start: number, end: number) {
    for (let index = end; index >= start; index--) {
        if (!!(states[index] & RowState.Selected) === state) {
            return index;
        }
    }
}

function setActive(state: RowStateProviderState, index: number | undefined): RowStateProviderState {
    if (!state.states) return state;

    const { states } = state;

    for (let index = 0; index < states.length; index++) {
        states[index] &= ~RowState.Active;
    }

    if (index) {
        states[index] |= RowState.Active;
    }

    return { ...state };
}

export function RowStateProvider({ items, mapper = getRowState, enabled = true, ...other }: RowStateProviderProps) {
    const [state, dispatch] = useReducer(reducer, { items, mapper }, getInitialState);
    const value = useMemo(() => {
        const { items, states, current } = state;
        return {
            selection: (items && states?.reduce((acc, current, index) => ((current & RowState.SelectMask) === RowState.SelectMask && acc.push(items[index]), acc), [] as Upnp.DIDL.Item[])) ?? [],
            current,
            enabled: enabled && !!states,
            allSelected: !!(states?.every(s => s & RowState.Selected)),
            get: (index: number) => states?.[index] ?? RowState.None,
            dispatch
        };
    }, [enabled, state]);

    if (state.items !== items || state.mapper !== mapper) {
        dispatch({ type: "INIT", initial: { items, mapper } });
    }

    return <RowStateContext {...other} value={value} />;
}

export { RowState }