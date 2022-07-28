import { useEffect, useMemo, useState } from "react";

export interface DataContext<T extends {} = {}> {
    source: T;
    reload(callback?: () => Promise<any>): Promise<void>;
}

export type DataFetchProps<T = {}> = {
    dataContext: DataContext<T> | null | undefined;
    fetching: boolean;
    error: unknown;
}

type FetchState<T> = { fetching: boolean, dataContext: DataContext<T> | undefined, error: unknown }

type Unwrap<F extends (...args: any) => any> = F extends (...args: any) => infer RT ? RT extends Promise<infer T> ? T : RT : never

type CtxType<F extends (...args: any) => any> = Exclude<Unwrap<F>, undefined | null>

export function useDataFetch<F extends (...args: any[]) => any>(fetcher: F, ...args: Parameters<F>): FetchState<CtxType<F>> {
    const [state, setState] = useState<FetchState<CtxType<F>>>({ fetching: true, dataContext: undefined, error: undefined });
    const fetchData = useMemo(() => (async (callback?: () => any) => {
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
    }), [fetcher, ...args]);

    useEffect(() => { fetchData() }, [fetchData]);

    return state;
}