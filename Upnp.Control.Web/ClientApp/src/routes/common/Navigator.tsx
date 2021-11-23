import { ComponentType, createContext, MouseEvent, useCallback, useContext } from "react";
import { Params, useNavigate, useParams, useSearchParams } from "react-router-dom";

interface NavigateHandler {
    (to: string): void
}

export type NavigationContextState = { navigate: NavigateHandler, params: Readonly<Params<string>> };

const NavigationContext = createContext<NavigationContextState>({ navigate: () => { }, params: {} });

export { NavigationContext };

export type NavigatorProps = { navigate: NavigateHandler }

type InjectedProps<Params> = NavigatorProps & Params;

export default function withNavigator<P extends InjectedProps<Params>, Params extends { [K in keyof Params]?: any }>(Component: ComponentType<P>) {
    return function (props: Omit<P, keyof InjectedProps<Params>>) {
        const navigate = useNavigate();
        const params = useParams();
        const [search] = useSearchParams()

        const merged = { ...params };
        search.forEach((value, key) => merged[key] = value);

        return <NavigationContext.Provider value={{ navigate, params: merged }}>
            <Component {...(props as unknown as P)} {...merged} navigate={navigate} />
        </NavigationContext.Provider>
    };
}

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