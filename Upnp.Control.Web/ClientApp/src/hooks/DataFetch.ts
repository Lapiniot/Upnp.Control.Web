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

type Unwrap<F extends (...args: unknown[]) => unknown> = PromiseResult<ReturnType<F>>

type CtxType<F extends (...args: unknown[]) => unknown> = Exclude<Unwrap<F>, undefined | null>

export function useDataFetch<F extends (...args: any[]) => any>(fetcher: F, ...args: Parameters<F>): FetchState<CtxType<F>> {
    const [state, setState] = useState<FetchState<CtxType<F>>>({ fetching: true, dataContext: undefined, error: undefined });
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