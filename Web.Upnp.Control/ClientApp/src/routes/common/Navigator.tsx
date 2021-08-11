import React, { ComponentType, PropsWithChildren, useCallback, useContext, useRef } from "react";
import { generatePath, useHistory, useLocation, useRouteMatch } from "react-router";

type NavigationHandler = (data: { [key: string]: string; }, pattern?: string) => void;
export type NavigationContextState = { navigate: NavigationHandler, params: { [K: string]: string | undefined } };

const NavigationContext = React.createContext<NavigationContextState>({ navigate: () => { }, params: {} });

export { NavigationContext };

export function NavigationProvider(props: PropsWithChildren<{}>) {
    const { search } = useLocation();
    const match = useRouteMatch();
    const history = useHistory();

    const ref = useRef({ history, match });
    ref.current = { history, match };

    const params: { [K: string]: any } = { ...match.params };
    new window.URLSearchParams(search).forEach((value, key) => params[key] = value);

    const navigate = useCallback((data, pattern) => {
        const { history, match: { path, params } } = ref.current;
        history.push(generatePath(pattern ?? path, { ...params, ...data }));
    }, []);

    return <NavigationContext.Provider value={{ navigate, params }}>{props.children}</NavigationContext.Provider>
}

export function useNavigation() {
    const { navigate, params } = useContext(NavigationContext);
    return { navigate, params };
}

export type NavigatorProps = { navigate: NavigationHandler }

type InjectedProps<Params> = NavigatorProps & Params;

export default function withNavigator<P extends InjectedProps<Params>, Params extends { [K in keyof Params]?: any }>(Component: ComponentType<P>) {
    return function (props: Omit<P, keyof InjectedProps<Params>>) {
        const { search } = useLocation();
        const history = useHistory();
        const match = useRouteMatch<Params>();
        const ref = useRef({ history, match });
        ref.current = { history, match };

        const handler = useCallback((data, pattern) => {
            const { history, match: { path, params } } = ref.current;
            history.push(generatePath(pattern ?? path, { ...params, ...data }));
        }, []);

        const params: { [K: string]: any } = { ...match.params };

        new window.URLSearchParams(search).forEach((value, key) => params[key] = value);

        return <Component {...(props as unknown as P)} {...params} navigate={handler} />;
    };
}