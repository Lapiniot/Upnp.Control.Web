import { useEffect, useMemo, useState } from "react";

export interface DataContext<T> {
    source: T,
    reload(callback?: () => Promise<unknown | void>): Promise<void>
}

export type DataFetchProps<T> = {
    dataContext: DataContext<T> | null | undefined,
    fetching: boolean,
    error: unknown
}

type FetchState<T> = { fetching: boolean, dataContext: DataContext<T> | undefined, error: unknown }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataType<T extends (...args: any[]) => any> = NonNullable<(T extends (...args: any[]) => infer U
    ? U extends Promise<infer V> ? V : U
    : never)>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDataFetch<F extends (...args: any[]) => any>(fetcher: F, ...args: Parameters<F>): FetchState<DataType<F>> {
    const [state, setState] = useState<FetchState<DataType<F>>>({ fetching: true, dataContext: undefined, error: undefined });
    const fetchData = useMemo(() => (async (callback?: () => unknown) => {
        try {
            setState(state => ({ ...state, fetching: true, error: undefined }));
            await callback?.();
            const data = await fetcher(...args);
            setState({ fetching: false, dataContext: data ? { source: data, reload: fetchData } : undefined, error: undefined });
        }
        catch (error) {
            console.error(error);
            setState(state => ({ ...state, fetching: false, error: error }));
            throw error;
        }
    }), [fetcher, ...args]); // eslint-disable-line

    useEffect(() => { fetchData() }, [fetchData]);

    return state;
}