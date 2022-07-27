import { useEffect, useMemo, useState } from "react";

interface ReloadFunc {
    (action?: (() => Promise<any>) | null, state?: {}): Promise<void>
}

export type DataContext<T = {}> = {
    source: T;
    reload: ReloadFunc;
}

export type DataFetchProps<T = {}> = {
    dataContext: DataContext<T> | null | undefined;
    fetching: boolean;
    error: unknown;
}

type FetchState<T> = { fetching: boolean, dataContext: DataContext<T> | undefined, error: unknown }

type Unwrap<F extends (...args: any) => any> = F extends (...args: any) => infer RT ? RT extends Promise<infer T> ? T : RT : never

export function useDataFetch<F extends (...args: any[]) => any>(loader: F, ...args: Parameters<F>): FetchState<Unwrap<F>> {
    const [state, setState] = useState<FetchState<Unwrap<F>>>({ fetching: true, dataContext: undefined, error: undefined });
    const fetchData = useMemo(() => (async (action?: (() => Promise<any>) | null) => {
        try {
            setState(state => ({ ...state, fetching: true, error: undefined }));
            await action?.();
            const data = await loader(...args);
            setState({ fetching: false, dataContext: { source: data, reload: fetchData }, error: undefined });
        }
        catch (error) {
            console.error(error);
            setState(state => ({ ...state, fetching: false, error: error }));
            throw error;
        }
    }), [loader, ...args]);

    useEffect(() => { fetchData() }, [fetchData]);

    return state;
}