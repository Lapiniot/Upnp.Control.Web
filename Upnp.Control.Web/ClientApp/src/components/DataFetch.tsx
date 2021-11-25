import { useEffect, useMemo, useState } from "react";

type ReloadFunc<T> = (action?: (() => Promise<any>) | null, state?: {}) => Promise<T>;

export type DataContext<T = {}> = {
    source: T;
    reload: ReloadFunc<T>;
}

export type DataFetchProps<T = {}> = {
    dataContext: DataContext<T> | null | undefined;
    fetching: boolean;
    error: unknown;
}

type FetchState<T> = { fetching: boolean, dataContext: DataContext<T> | undefined, error: unknown }

interface LoaderFunction<T> { (): Promise<T> };

export function useDataFetch<T>(loader: LoaderFunction<T>): FetchState<T> {
    const [state, setState] = useState<FetchState<T>>({ fetching: true, dataContext: undefined, error: undefined });
    const fetchData = useMemo(() => (async (action?: (() => Promise<any>) | null) => {
        try {
            setState(state => ({ ...state, fetching: true, error: undefined }));
            await action?.();
            const data = await loader();
            setState({ fetching: false, dataContext: { source: data, reload: fetchData }, error: undefined });
            return data;
        }
        catch (error) {
            console.error(error);
            setState(state => ({ ...state, fetching: false, error: error }));
            throw error;
        }
    }), [loader]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return state;
}