import React, { createContext, PropsWithChildren, ReactElement, useCallback, useContext, useState } from "react";
import { matchPath, PathMatch, resolvePath } from "react-router-dom";
import { NavigationContext, Path } from "../../components/Navigator";

type VirtualRouterProps = {
    initialPath: string;
};

function matchRoutes(location: string, routes: ReactElement[]): { route: ReactElement; match: PathMatch<string>; } | undefined {
    const matches = routes.map(route => ({ route, match: matchPath({ path: route.props.path }, location) }))
        .filter(m => m.match !== null) as { route: ReactElement, match: PathMatch<string> }[];
    return matches.find(({ match: { pattern: { path } } }) => path.indexOf("*") < 0 && path.indexOf(":") < 0) ??
        matches.find(({ match: { pattern: { path } } }) => path.indexOf("*") >= 0 && path.indexOf(":") < 0) ??
        matches[0];
}

interface NavigationLocationContextObject {
    location: URL;
    setLocation(to: URL): void;
    match: PathMatch<string> | undefined;
}

const RouterContext = createContext<NavigationLocationContextObject>({
    location: new URL(".", location.href),
    setLocation: (to: URL) => { },
    match: undefined
});

function resolveUrl(to: string | Partial<Path>, baseUrl: URL) {
    const path = resolvePath(to, baseUrl.pathname);
    const url = new URL(path.pathname, location.origin);
    url.hash = path.hash;
    url.search = path.search;
    return url;
}

function useNavigateImpl() {
    const { location, setLocation } = useContext(RouterContext);
    const navigate = useCallback((to) => {
        const url = resolveUrl(to, location);
        return setLocation(url);
    }, [location]);
    return navigate;
}

function useParamsImpl() {
    const { match } = useContext(RouterContext);
    return match?.params ?? {};
}

function useSearchParamsImpl(): readonly [URLSearchParams, (nextInit: URLSearchParams) => void] {
    const { location } = useContext(RouterContext);
    return [location.searchParams, (init: URLSearchParams) => { }]
}

function useResolvedPathImpl(to: string | Partial<Path>) {
    const { location } = useContext(RouterContext);
    const path = resolvePath(to, location.pathname);
    return path;
}

export function VirtualRouter(props: PropsWithChildren<VirtualRouterProps>) {
    const [location, setLocation] = useState(new URL(props.initialPath, window.location.origin));
    const routes = React.Children.toArray(props.children).filter(c => (c as ReactElement).type === Route) as ReactElement[];
    const bestMatch = matchRoutes(location.pathname, routes);

    return <RouterContext.Provider value={{ location, setLocation, match: bestMatch?.match }}>
        <NavigationContext.Provider value={{ useNavigateImpl, useParamsImpl, useSearchParamsImpl, useResolvedPathImpl }}>
            {bestMatch?.route}
        </NavigationContext.Provider>
    </RouterContext.Provider>
}

type RouteProps = {
    path: string;
    element: ReactElement | null
};

function testMatching() {
    const match1 = matchPath({ path: "/umi", end: true }, "/umi/b72a4cfc-79e3-18aa-a2fa-98ebbb372725/playlists/PL:182");
    const match2 = matchPath({ path: "/umi", end: false }, "/umi/b72a4cfc-79e3-18aa-a2fa-98ebbb372725/playlists/PL:182");
    const match3 = matchPath({ path: "/umi/:device", end: true }, "/umi/b72a4cfc-79e3-18aa-a2fa-98ebbb372725/playlists/PL:182");
    const match4 = matchPath({ path: "/umi/:device", end: false }, "/umi/b72a4cfc-79e3-18aa-a2fa-98ebbb372725/playlists/PL:182");
}

export function Route(props: PropsWithChildren<RouteProps>) {
    return props.element;
}
