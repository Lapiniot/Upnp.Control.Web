import { ComponentType, useCallback, useRef } from "react";
import { generatePath, useHistory, useLocation, useRouteMatch } from "react-router";

export type NavigatorProps = { navigate: (data: { [key: string]: string }, pattern?: string) => void }

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