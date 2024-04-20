import { createContext, MouseEvent, useCallback, useContext, useRef } from "react";
import * as ReactRouter from "react-router-dom";

export type Path = {
    pathname: string;
    search: string;
    hash: string;
}

export interface NavigateFunction { (to: string | Partial<Path>): void }

type Params<TKey extends string = string> = { readonly [K in TKey]: string | undefined }

interface NavigationContextHooks {
    useNavigateImpl(): NavigateFunction;
    useParamsImpl(): Readonly<Params<string>>;
    useSearchParamsImpl(): readonly [URLSearchParams, (nextInit: URLSearchParams) => void];
    useResolvedPathImpl(to: string | Partial<Path>): Path;
}

// Initialize context defaults to "react-router-dom" provided implementations
const NavigationContext = createContext<NavigationContextHooks>({
    useNavigateImpl: ReactRouter.useNavigate,
    useParamsImpl: ReactRouter.useParams,
    useSearchParamsImpl: ReactRouter.useSearchParams,
    useResolvedPathImpl: ReactRouter.useResolvedPath
})

export { NavigationContext }

export function useNavigator<TKey extends string = string>() {
    const { useNavigateImpl, useParamsImpl, useSearchParamsImpl } = useContext(NavigationContext);

    const navigate = useNavigateImpl();
    const params = useParamsImpl();
    const [search] = useSearchParamsImpl();

    const merged = { ...params };
    search.forEach((value, key) => merged[key] = value);

    return { navigate, params: merged as Params<TKey>, search };
}

export function useNavigatorResolvedPath(to: string) {
    const { useResolvedPathImpl } = useContext(NavigationContext);
    return useResolvedPathImpl(to);
}

export function useNavigatorClickHandler() {
    const { useNavigateImpl } = useContext(NavigationContext);
    const navigate = useNavigateImpl();
    const ref = useRef(navigate);
    ref.current = navigate;
    return useCallback((event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const { pathname, search, hash } = event.currentTarget;
        ref.current({ pathname, search, hash });
    }, []);
}

export function createSearchParams(init: { [K in string]: string }) {
    const search = new URLSearchParams();
    for (const key in init) search.set(key, init[key]);
    return search;
}

export function useSearchParams() {
    const { useSearchParamsImpl } = useContext(NavigationContext);
    return useSearchParamsImpl();
}