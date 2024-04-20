import {
    Children, ContextType, createContext, PropsWithChildren,
    ReactElement, ReactNode, useCallback, useContext, useRef, useState
} from "react";
import { matchRoutes, resolvePath, RouteMatch, RouteObject } from "react-router-dom";
import { NavigateFunction, NavigationContext, Path } from "../hooks/Navigator";

interface VirtualRouterProps {
    initialPath: string
}

interface RouteBaseProps {
    caseSensitive?: boolean,
    path?: string;
    element?: React.ReactNode | null
}

interface IndexRouteProps extends RouteBaseProps {
    index: true,
    children?: undefined
}

interface NonIndexRouteProps extends RouteBaseProps {
    index?: false,
    children?: ReactNode
}

type RouteProps = IndexRouteProps | NonIndexRouteProps;

interface RouterLocationContextObject {
    location: URL,
    setLocation(to: URL | ((current: URL) => URL)): void
}

interface RouterMatchContextObject {
    matches: RouteMatch[] | null,
    level: number
}

const RouterLocationContext = createContext<RouterLocationContextObject>({
    location: new URL(".", location.href),
    setLocation: () => { }
})

const RouterMatchContext = createContext<RouterMatchContextObject>({ matches: null, level: -1 })

function filterRouteElements(node: ReactNode): node is ReactElement<RouteProps> {
    if (node && typeof node === "object" && "type" in node && node.type === Route)
        return true;
    throw new Error("<Routes> or <Route> elements may only have <Route> elements as their children");
}

function buildRoutes(children: ReactNode | ReactNode[]): RouteObject[] {
    return Children.toArray(children).filter(filterRouteElements).map(
        ({ props: { index, children, ...other } }) => (index === true
            ? { ...other, index: true, children: undefined }
            : { ...other, index, children: buildRoutes(children) }));
}

// some <Route /> elements do not contribute to path resolution, so filter them out.
function getEffectivePathnames(matches: RouteMatch[]): string[] {
    return matches.filter((match, index) => index === 0 || match.route.path && match.route.path.length > 0)
        .map((match, index, array) => index === array.length - 1 ? match.pathname : match.pathnameBase);
}

function parsePath(pathname: string) {
    let hash; let search;

    const searchIndex = pathname.lastIndexOf("?");
    if (searchIndex >= 0) {
        search = pathname.substring(searchIndex);
        pathname = pathname.substring(0, searchIndex);
    }

    const hashIndex = pathname.lastIndexOf("#");
    if (hashIndex >= 0) {
        hash = pathname.substring(hashIndex);
        pathname = pathname.substring(0, hashIndex);
    }

    return { pathname, hash, search };
}

function resolvePathMatches(to: string | Partial<Path>, fromRoutePathnames: string[] | null, fromLocationPathname: string) {
    if (typeof to === "string") {
        to = parsePath(to);
    }

    if (!to.pathname || !fromRoutePathnames?.length) {
        return resolvePath(to, fromLocationPathname);
    }

    let index = fromRoutePathnames.length - 1;
    if (!to.pathname.startsWith("/")) {
        while ((to.pathname.startsWith("..")) && index >= 0) {
            to.pathname = to.pathname.substring(2);
            if (to.pathname.startsWith("/")) {
                to.pathname = to.pathname.substring(1);
            }
            index--;
        }
    }

    return resolvePath(to, fromRoutePathnames[index]);
}

function useNavigate() {
    const { location, setLocation } = useContext(RouterLocationContext);
    const { matches } = useContext(RouterMatchContext);
    const ctx = { location, setLocation, matches };
    const ref = useRef(ctx);
    ref.current = ctx;
    const navigate = useCallback<NavigateFunction>((to) => {
        const { matches, location: { pathname, origin }, setLocation } = ref.current!;
        const pathnames = getEffectivePathnames(matches ?? []);
        const path = resolvePathMatches(to, pathnames, pathname);
        const url = new URL(path.pathname, origin);
        url.hash = path.hash;
        url.search = path.search;
        return setLocation(url);
    }, []);
    return navigate;
}

function useParams() {
    const { matches } = useContext(RouterMatchContext);
    return matches?.length ? matches[matches.length - 1].params : {};
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
    const { location: { pathname } } = useContext(RouterLocationContext);
    const { matches } = useContext(RouterMatchContext);
    return resolvePathMatches(to, getEffectivePathnames(matches ?? []), pathname);
}

const hooks: ContextType<typeof NavigationContext> = {
    useNavigateImpl: useNavigate,
    useParamsImpl: useParams,
    useSearchParamsImpl: useSearchParams,
    useResolvedPathImpl: useResolvedPath
}

export function VirtualRouter({ children, initialPath }: PropsWithChildren<VirtualRouterProps>) {
    const [location, setLocation] = useState(() => new URL(initialPath, window.location.origin));
    const ref = useRef(initialPath);

    if (initialPath !== ref.current) {
        ref.current = initialPath;
        setLocation(new URL(initialPath, window.location.origin));
    }

    return <NavigationContext.Provider value={hooks}>
        <RouterLocationContext.Provider value={{ location, setLocation }}>
            {children}
        </RouterLocationContext.Provider>
    </NavigationContext.Provider>
}

export function Routes({ children }: { children: ReactElement | Iterable<ReactNode> }) {
    const { location } = useContext(RouterLocationContext);
    const { matches: parentMatches, level } = useContext(RouterMatchContext);
    const basename = parentMatches?.length ? parentMatches[parentMatches.length - 1].pathnameBase : undefined;

    const routes = buildRoutes(children);
    const matches = matchRoutes(routes, location.pathname, basename);

    if (!matches?.length) return null;

    const merged = parentMatches?.length ? [...parentMatches, ...matches] : matches;

    return <RouterMatchContext.Provider value={{ matches: merged, level: level + 1 }}>
        {matches[0].route.element ?? <Outlet />}
    </RouterMatchContext.Provider>
}

export function Route(_: RouteProps): never {
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
