import { createContext, MouseEvent, useCallback, useContext, useRef } from "react";
import { useNavigate, useParams, useResolvedPath, useSearchParams } from "react-router-dom";

export type Path = {
    pathname: string;
    search: string;
    hash: string;
}

export interface NavigateFunction {
    (to: string | Partial<Path>): void;
}

type Params<TKey extends string = string> = { readonly [K in TKey]: string | undefined };

interface NavigationContextHooks {
    useNavigate(): NavigateFunction;
    useParams(): Readonly<Params<string>>;
    useSearchParams(): readonly [URLSearchParams, (nextInit: URLSearchParams) => void];
    useResolvedPath(to: string | Partial<Path>): Path;
}

const NavigationContext = createContext<NavigationContextHooks>({ useNavigate, useParams, useSearchParams, useResolvedPath })

export { NavigationContext };

export function useNavigator<TKey extends string = string>() {
    const { useNavigate, useParams, useSearchParams } = useContext(NavigationContext);

    const navigate = useNavigate();
    const params = useParams();
    const [search] = useSearchParams();

    const merged = { ...params };
    search.forEach((value, key) => merged[key] = value);

    return { navigate, params: merged as Params<TKey>, search };
}

export function useNavigatorResolvedPath(to: string) {
    const { useResolvedPath } = useContext(NavigationContext);
    return useResolvedPath(to);
}

export function useNavigatorClickHandler() {
    const { useNavigate } = useContext(NavigationContext);
    const navigate = useNavigate();
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
    for (let k in init) search.set(k, init[k]);
    return search;
}