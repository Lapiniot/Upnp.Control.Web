import { createContext, useContext } from "react";

export const enum RowState {
    None = 0b0,
    Disabled = 0b1,
    Active = 0b10,
    Selectable = 0b100,
    Selected = 0b1000,
    Readonly = 0x10000,
    Navigable = 0x100000,
    SelectMask = Selectable | Selected
}

export interface RowStateMapperFunction {
    (item: Upnp.DIDL.Item, index: number, state: RowState | undefined): RowState
}

export type RowStateAction =
    { type: "INIT", initial: { items: Upnp.DIDL.Item[] | undefined, mapper: RowStateMapperFunction } } |
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
    { type: "SET_ACTIVE", index: number | undefined }

type RowStateContextData = {
    enabled: boolean;
    current: number | undefined,
    selection: Upnp.DIDL.Item[],
    allSelected: boolean,
    dispatch: React.Dispatch<RowStateAction>,
    get: (index: number) => RowState
}

const RowStateContext = createContext<RowStateContextData>({
    enabled: false,
    current: undefined,
    selection: [],
    allSelected: false,
    dispatch: () => { },
    get: () => RowState.None,
})

export default RowStateContext

export function useRowStates() {
    return useContext(RowStateContext);
}