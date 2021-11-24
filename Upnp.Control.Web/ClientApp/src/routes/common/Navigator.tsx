import { createContext, MouseEvent, PropsWithChildren, useCallback, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

interface NavigateHandler {
    (to: string): void;
}

type Params<TKey extends string = string> = { readonly [K in TKey]: string | undefined };

type NavigationContextObject = { navigate: NavigateHandler, params: Params };

const NavigationContext = createContext<NavigationContextObject>({ navigate: () => { }, params: {} });

export { NavigationContext };

export type NavigatorProps = { navigate: NavigateHandler }

export function BrowserRouterNavigationContextProvider({ children }: PropsWithChildren<{}>) {
    const navigate = useNavigate();
    const params = useParams();
    const [search] = useSearchParams()

    const merged = { ...params };
    search.forEach((value, key) => merged[key] = value);

    return <NavigationContext.Provider value={{ navigate, params: merged }}>{children}</NavigationContext.Provider>
};

export function useNavigator<TKey extends string = string>() {
    const { navigate, params } = useContext(NavigationContext);
    return { navigate, params: params as Params<TKey> };
}

export function useNavigatorClickHandler() {
    const { navigate } = useContext(NavigationContext);
    const handler = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        navigate(event.currentTarget.href);
    }, [navigate]);
    return handler;
}