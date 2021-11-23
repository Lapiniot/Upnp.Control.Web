import React, { PropsWithChildren, ReactElement, useCallback, useState } from "react";
import { matchPath, PathMatch } from "react-router-dom";
import { NavigationContext } from "./Navigator";

type VirtualRouterProps = {
    initialPath: string;
};

function matchRoutes(location: string, routes: ReactElement[]) {
    const matches = routes.map(route => ({ route, match: matchPath({ path: route.props.path }, location) }))
        .filter(m => m.match !== null) as { route: ReactElement, match: PathMatch<string> }[];
    return matches.find(({ match: { pattern: { path } } }) => path.indexOf("*") < 0 && path.indexOf(":") < 0) ??
        matches.find(({ match: { pattern: { path } } }) => path.indexOf("*") >= 0 && path.indexOf(":") < 0) ??
        matches[0];
}

export function VirtualRouter(props: PropsWithChildren<VirtualRouterProps>) {
    const [location, setLocation] = useState(new URL(props.initialPath, window.location.origin));
    const navigate = useCallback((to) => {
        const url = new URL(to, location.href+"/");
        if (url.origin === window.location.origin)
            return setLocation(url);
        else
            window.history.pushState(null, "", url);
    }, [location]);

    const routes = React.Children.toArray(props.children).filter(r => (r as ReactElement).type === Route) as ReactElement[];
    const bestMatch = matchRoutes(location.pathname, routes);

    return <NavigationContext.Provider value={{ navigate, params: { ...bestMatch?.match?.params } }}>
        {bestMatch?.route}
    </NavigationContext.Provider>;
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
