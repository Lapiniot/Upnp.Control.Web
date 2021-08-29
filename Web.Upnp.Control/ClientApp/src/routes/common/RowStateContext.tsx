import { createContext, PropsWithChildren, useContext, useMemo, useReducer } from "react";
import { DIDLItem, RowState } from "./Types";

export type RowStateAction =
    { type: "UPDATE"; props: Partial<Omit<RowStateProviderState, "states" | "current">> } |
    { type: "TOGGLE", index: number } |
    { type: "TOGGLE_ALL" } |
    { type: "SET", index: number, selected: boolean } |
    { type: "SET_ONLY", index: number } |
    { type: "SET_ALL", selected: boolean } |
    { type: "EXPAND_TO", index: number } |
    { type: "EXPAND_UP" } |
    { type: "EXPAND_DOWN" } |
    { type: "PREV" } |
    { type: "NEXT" } |
    { type: "SET_ACTIVE", index: number | undefined };

type RowStateContextData = {
    enabled: boolean;
    current: number | undefined,
    selection: DIDLItem[],
    allSelected: boolean,
    dispatch: React.Dispatch<RowStateAction>,
    get: (index: number) => RowState
};

export type RowStateMapper = (item: DIDLItem, index: number, state: RowState | undefined) => RowState;

const RowStateContext = createContext<RowStateContextData>({
    enabled: false,
    current: undefined,
    selection: [],
    allSelected: false,
    dispatch: () => { },
    get: () => RowState.None,
});

export default RowStateContext;

export type RowStateProviderProps = PropsWithChildren<{}> & {
    items: DIDLItem[] | undefined,
    mapper?: RowStateMapper,
    enabled?: boolean
};

type RowStateProviderState = {
    items: DIDLItem[] | undefined,
    mapper: RowStateMapper | undefined,
    states: RowState[] | undefined,
    current: number | undefined
}

function set(state: RowStateProviderState, index: number, selected: boolean) {
    if (index < 0 || !state.states || index >= state.states.length)
        return;

    if (selected) {
        state.states[index] |= RowState.Selected;
        state.current = index;
    }
    else {
        state.states[index] &= ~RowState.Selected;
        if (index === state.current)
            state.current = undefined;
    }
}

function toggle(state: RowStateProviderState, index: number) {
    if (!state.states) return;

    state.states[index] ^= RowState.Selected;

    if (state.states[index] & RowState.Selected) {
        state.current = index;
    } else if (state.current === index) {
        state.current = undefined;
    }
}

function setOnly(state: RowStateProviderState, index: number) {
    if (index < 0 || !state.states || index >= state.states.length) return;

    for (let i = 0; i < state.states.length; i++) {
        state.states[i] &= ~RowState.Selected;
    }

    state.states[index] |= RowState.Selected;
    state.current = index;
}

function setAll(state: RowStateProviderState, selected: boolean) {
    if (!state.states) return;

    if (selected) {
        for (let i = 0; i < state.states.length; i++) {
            state.states[i] |= RowState.Selected;
        }
        state.current = state.states.length - 1;
    }
    else {
        for (let i = 0; i < state.states.length; i++) {
            state.states[i] &= ~RowState.Selected;
        }
        state.current = undefined;
    }
}

function expandTo(state: RowStateProviderState, index: number) {
    if (index < 0 || !state.states || index >= state.states.length) return;

    if (state.current === undefined) {
        set(state, index, true);
        return;
    }

    const current = state.current;
    const start = Math.min(current, index);
    const end = Math.max(current, index);
    const solidRange = findFirstInRange(state.states, false, start, end) === undefined;

    if (solidRange) {
        //trim selection
        if (index > current)
            for (let i = current; i < index; i++)
                state.states[i] &= ~RowState.Selected;
        else
            for (let i = index + 1; i <= current; i++)
                state.states[i] &= ~RowState.Selected;
    }
    else {
        // expand selection
        for (let i = start; i <= end; i++)
            state.states[i] |= RowState.Selected;
    }

    state.current = index;
}

function expandDown(state: RowStateProviderState) {
    if (!state.states) return;

    if (state.current === undefined) {
        setOnly(state, 0);
        return;
    }

    const index = state.current + 1;

    if (index < state.states.length) {
        if (!(state.states[index] & RowState.Selected)) {
            // nex item is not selected - select it and move focus to the end of a new "solid" range
            const next = findFirstInRange(state.states, false, index + 1, state.states.length);
            state.states[index] |= RowState.Selected;
            state.current = next !== undefined ? next - 1 : state.states.length - 1;
        }
        else {
            // next item is already selected - unselect it and move focus one item down, "trimming" nearest range from the top
            state.states[index - 1] &= ~RowState.Selected;
            state.current = index;
        }
    }
}

function expandUp(state: RowStateProviderState) {

    if (!state.states) return;

    if (state.current === undefined) {
        setOnly(state, state.states.length - 1);
        return;
    }

    const index = state.current - 1;
    if (index >= 0) {
        if (!(state.states[index] & RowState.Selected)) {
            // previouse item is not selected - select it and move focus to the beginning of a new "solid" range
            const next = findLastInRange(state.states, false, 0, index - 1);
            state.states[index] |= RowState.Selected;
            state.current = next !== undefined ? next + 1 : 0;
        }
        else {
            // previouse item is already selected - unselect it and move focus one item up, "trimming" nearest range from the bottom
            state.states[index + 1] &= ~RowState.Selected;
            state.current = index;
        }
    }
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

function setActive(state: RowStateProviderState, index: number | undefined) {
    if (!state.states) return;

    for (let index = 0; index < state.states.length; index++) {
        state.states[index] &= ~RowState.Active;
    }
    if (index) {
        state.states[index] |= RowState.Active;
    }
}

function reducer(state: RowStateProviderState, action: RowStateAction): RowStateProviderState {
    switch (action.type) {
        case "UPDATE":
            const ns = { ...state, ...action.props };
            const mapper = ns.mapper;

            if (ns.items && mapper) {
                if (state.items !== ns.items)
                    return { ...ns, states: ns.items.map((item, index) => mapper(item, index, undefined)), current: undefined }
                else if (state.mapper !== ns.mapper) {
                    const states = state.states;
                    if (states !== undefined)
                        return { ...ns, states: ns.items.map((item, index) => mapper(item, index, states[index])) }
                    return { ...ns, states: ns.items.map((item, index) => mapper(item, index, undefined)) }
                }
                return state;
            }
            return { ...ns, states: undefined, current: undefined }
        case "TOGGLE":
            toggle(state, action.index);
            return { ...state };
        case "TOGGLE_ALL":
            if (state.states)
                setAll(state, state.states.some(rs => (rs & RowState.SelectMask) === RowState.Selectable));
            return { ...state };
        case "SET":
            set(state, action.index, action.selected);
            return { ...state };
        case "SET_ONLY":
            setOnly(state, action.index);
            return { ...state };
        case "SET_ALL":
            setAll(state, action.selected);
            return { ...state };
        case "PREV":
            setOnly(state, state.current !== undefined ? state.current - 1 : (state.states?.length ?? 0) - 1)
            return { ...state };
        case "NEXT":
            setOnly(state, state.current !== undefined ? state.current + 1 : 0)
            return { ...state };
        case "EXPAND_TO":
            expandTo(state, action.index);
            return { ...state };
        case "EXPAND_DOWN":
            expandDown(state);
            return { ...state };
        case "EXPAND_UP":
            expandUp(state);
            return { ...state };
        case "SET_ACTIVE":
            setActive(state, action.index);
            return { ...state };
        default: throw new Error("invalid action");
    }
}

function getRowState() {
    return RowState.Selectable | RowState.Navigable;
}

const initial = { items: undefined, mapper: undefined, states: undefined, current: undefined };

export function RowStateProvider({ items, mapper = getRowState, enabled = true, ...other }: RowStateProviderProps) {

    const [state, dispatch] = useReducer(reducer, initial, () => {
        return ({
            items: items,
            mapper: mapper,
            states: items?.map((item, index) => mapper(item, index, undefined)),
            current: undefined,
        })
    });

    const value = useMemo(() => ({
        selection: (items && state.states?.reduce((acc: DIDLItem[], current, index) =>
            ((current & RowState.SelectMask) === RowState.SelectMask && acc.push(items[index]), acc), [])) ?? [],
        current: state.current,
        enabled: enabled && !!(state.states),
        allSelected: !!(state.states?.every(s => s & RowState.Selected)),
        get: (index: number) => state.states?.[index] ?? RowState.None,
        dispatch
    }), [state.states, state.current, enabled]);

    if (state.items !== items || state.mapper !== mapper) {
        dispatch({ type: "UPDATE", props: { items, mapper } });
    }

    return <RowStateContext.Provider {...other} value={value} />;
}

export function useRowStates() {
    return useContext(RowStateContext);
}