import { useEffect, useMemo, useState } from "react";

export interface DataContext<T> {
    source: T,
    reload(callback?: () => Promise<unknown | void>): Promise<void>,
    next?(): Promise<void>
}

export type DataFetchProps<T> = {
    dataContext: DataContext<T> | null | undefined,
    fetching: boolean,
    error: unknown
}

type FetchResult<T> = T | PageFetchResult<T>

/**
 * Type representing a fetch page result.
 */
type PageFetchResult<T> = {
    /**
     * Single page of data
     */
    data: T,
    /**
     * Function which fetches next page of data
     */
    continuation?(): Promise<FetchResult<T>>,
    /**
     * Function which implements merge logic
     * @param {T} current - holds already fetched (accumulated) portion of the data
     * @param {T} fetched - new portion of data to be merged in
     */
    merge?(current: T, fetched: T): T
}

type FetchState<T> = { fetching: boolean, dataContext: DataContext<T> | undefined, error: unknown }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataType<T extends (...args: any[]) => any> = NonNullable<(T extends (...args: any[]) => infer U
    ? U extends Promise<infer V>
    ? V extends FetchResult<infer X> ? X : V
    : U extends FetchResult<infer Y> ? Y : U
    : never)>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDataFetch<F extends (...args: any[]) => any>(fetcher: F, ...args: Parameters<F>): FetchState<DataType<F>> {
    const [state, setState] = useState<FetchState<DataType<F>>>({ fetching: true, dataContext: undefined, error: undefined });
    const fetchData = useMemo(() => (async (callback?: () => unknown) => {
        setState(state => ({ ...state, fetching: true, error: undefined }));

        try {
            await callback?.();
            const fetchResult = await fetcher(...args) as FetchResult<DataType<F>>;
            setResult(fetchResult);
        }
        catch (error) {
            setError(error);
        }

        function setResult(fetchResult: FetchResult<DataType<F>>) {
            if (typeof fetchResult === "object" && fetchResult && "data" in fetchResult) {
                const { data, continuation, merge } = fetchResult;
                setState(({ dataContext }) => {
                    const source = dataContext?.source && data && typeof merge === "function"
                        ? merge(dataContext.source, data)
                        : data;
                    const next = typeof continuation === "function" ? async function () {
                        setState(state => ({ ...state, fetching: true, error: undefined }));
                        try {
                            const nextPageResult = await continuation();
                            setResult(nextPageResult);
                        } catch (error) {
                            setError(error);
                        }
                    } : undefined;
                    return {
                        fetching: false,
                        dataContext: source ? { source, reload: fetchData, next } : undefined,
                        error: undefined
                    }
                });
            } else {
                setState({
                    fetching: false, dataContext: fetchResult
                        ? { source: fetchResult, reload: fetchData }
                        : undefined,
                    error: undefined
                });
            }
        }

        function setError(error: unknown) {
            console.error(error);
            setState(state => ({ ...state, fetching: false, error: error }));
            throw error;
        }
    }), [fetcher, ...args]); // eslint-disable-line

    useEffect(() => { fetchData() }, [fetchData]);

    return state;
}