import React, { createContext, PropsWithChildren, ReactElement, ReactFragment, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { matchRoutes, resolvePath, RouteMatch, RouteObject } from "react-router-dom";
import { NavigateFunction, NavigationContext, Path } from "../../components/Navigator";

interface VirtualRouterProps {
    initialPath: string
};

interface RouteProps {
    caseSensitive?: boolean;
    element?: React.ReactElement;
    index?: boolean;
    path?: string;
    children?: ReactElement | ReactFragment;
}

function buildRoutes(children: ReactNode | undefined): RouteObject[] {
    const routes = new Array<RouteObject>();
    const array = React.Children.toArray(children);
    for (let index = 0; index < array.length; index++) {
        const child = array[index] as ReactElement<RouteProps>;
        if (child.type === Route) {
            routes.push({ ...child.props, children: buildRoutes(child.props.children) });
        } else {
            throw new Error("<Routes> or <Route> elements may only have <Route> elements as their children");
        }
    }
    return routes;
}

interface RouterLocationContextObject {
    location: URL;
    setLocation(to: URL | ((current: URL) => URL)): void;
}

interface RouterMatchContextObject {
    matches: RouteMatch[] | null;
    level: number;
}

const RouterLocationContext = createContext<RouterLocationContextObject>({
    location: new URL(".", location.href),
    setLocation: () => { }
})

const RouterMatchContext = createContext<RouterMatchContextObject>({
    matches: null,
    level: 0
})

function resolvePathMatches(to: string | Partial<Path>, matches: RouteMatch[]) {
    if (!matches?.length) return undefined;

    let match: RouteMatch = matches[matches.length - 1];
    let pathname = typeof to === "string" ? to : to.pathname ?? "";
    if (!pathname.startsWith("/")) {
        let index = 1;
        while ((pathname.startsWith("..")) && index < matches.length) {
            pathname = pathname.substring(2);
            pathname = pathname.startsWith("/") ? pathname.substring(1) : pathname;
            match = matches[matches.length - ++index];
        }
    }

    return resolvePath(typeof to === "string" ? pathname : { ...to, pathname }, match.pathname);
}

function useNavigate() {
    const { location, setLocation } = useContext(RouterLocationContext);
    const { matches } = useContext(RouterMatchContext);
    const ref = useRef({ location, setLocation, matches });
    ref.current = { location, setLocation, matches };
    const navigate = useCallback<NavigateFunction>((to) => {
        const { matches, location: { pathname, origin }, setLocation } = ref.current;
        const path = (matches && resolvePathMatches(to, matches)) ?? resolvePath(to, pathname);
        const url = new URL(path.pathname, origin);
        url.hash = path.hash;
        url.search = path.search;
        return setLocation(url);
    }, []);
    return navigate;
}

function useParams() {
    const { matches } = useContext(RouterMatchContext);
    return matches?.[0].params ?? {};
}

function useSearchParams(): readonly [URLSearchParams, (nextInit: URLSearchParams) => void] {
    const { location, setLocation } = useContext(RouterLocationContext);
    return [location.searchParams, (init: URLSearchParams) => setLocation(location => {
        const url = new URL(location);
        url.search = init.toString();
        return url;
    })]
}

function useResolvedPath(to: string | Partial<Path>) {
    const { location } = useContext(RouterLocationContext);
    const { matches } = useContext(RouterMatchContext);
    return (matches && resolvePathMatches(to, matches)) ?? resolvePath(to, location.pathname);
}

const hooks = { useNavigate, useParams, useSearchParams, useResolvedPath }

export function VirtualRouter({ children, initialPath }: PropsWithChildren<VirtualRouterProps>) {
    const [location, setLocation] = useState(() => new URL(initialPath, window.location.origin));
    const ref = useRef(initialPath);

    useEffect(() => {
        if (initialPath !== ref.current) {
            ref.current = initialPath;
            setLocation(new URL(initialPath, window.location.origin));
        }
    }, [initialPath]);

    return <NavigationContext.Provider value={hooks}>
        <RouterLocationContext.Provider value={{ location, setLocation }}>
            {children}
        </RouterLocationContext.Provider>
    </NavigationContext.Provider>
}

export function Routes({ children }: { children: ReactElement | ReactFragment }) {
    const { location } = useContext(RouterLocationContext);
    const { matches: pmatches } = useContext(RouterMatchContext);
    const basename = pmatches?.length ? pmatches[pmatches.length - 1].pathnameBase : undefined;
    const routes = buildRoutes(children);
    const matches = matchRoutes(routes, location.pathname, basename);
    return (matches?.length)
        ? <RouterMatchContext.Provider value={{ matches, level: 0 }}>
            {matches[0].route.element ?? <Outlet />}
        </RouterMatchContext.Provider>
        : null;
}

export function Route({ }: RouteProps): never {
    throw new Error("<Route> element cannot be used as standalone outside of its parent <Routes> or <Route>");
}

export function Outlet() {
    const { matches, level } = useContext(RouterMatchContext);
    const next = level + 1;
    return (matches && next < matches.length)
        ? <RouterMatchContext.Provider value={{ matches, level: next }}>
            {matches[next].route.element ?? <Outlet />}
        </RouterMatchContext.Provider>
        : null
}