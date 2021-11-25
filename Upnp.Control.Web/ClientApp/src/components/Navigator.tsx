import { createContext, MouseEvent, PropsWithChildren, useCallback, useContext, useRef } from "react";
import { useNavigate, useParams, useResolvedPath, useSearchParams } from "react-router-dom";

type Path = {
    pathname: string;
    search: string;
    hash: string;
}

interface NavigateFunction {
    (to: string | Partial<Path>): void;
}

interface PathResolveFunction {
    (to: string | Partial<Path>): Path;
}

type Params<TKey extends string = string> = { readonly [K in TKey]: string | undefined };

type NavigationContextObject = {
    navigate: NavigateFunction,
    resolver: PathResolveFunction,
    params: Params,
    search: URLSearchParams
};

const NavigationContext = createContext<NavigationContextObject>({
    navigate: noContextHandler,
    resolver: noContextHandler,
    params: {},
    search: new URLSearchParams(),
});

export { NavigationContext };

export type NavigatorProps = { navigate: NavigateFunction }

function noContextHandler(): never {
    throw new Error("NavigationContext is not available");
}

export function BrowserRouterNavigationContextProvider({ children }: PropsWithChildren<{}>) {
    const navigate = useNavigate();
    const params = useParams();
    const [search] = useSearchParams();
    const ref = useRef(navigate);
    ref.current = navigate;
    const navigateImpl = useCallback((to) => ref.current(to), []);

    const merged = { ...params };
    search.forEach((value, key) => merged[key] = value);

    return <NavigationContext.Provider value={{ navigate: navigateImpl, resolver: useResolvedPath, params: merged, search }}>{children}</NavigationContext.Provider>
};

export function useNavigator<TKey extends string = string>() {
    const { navigate, params, search } = useContext(NavigationContext);
    return { navigate, params: params as Params<TKey>, search };
}

export function useNavigatorResolvedPath(to: string) {
    const { resolver: useResolved } = useContext(NavigationContext);
    return useResolved(to);
}

export function useNavigatorClickHandler() {
    const { navigate } = useContext(NavigationContext);
    return useCallback((event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const { pathname, search, hash } = event.currentTarget;
        navigate({ pathname, search, hash });
    }, [navigate]);
}

export function createSearchParams(init: { [K in string]: string }) {
    const search = new URLSearchParams();
    for (let k in init) search.set(k, init[k]);
    return search;
}