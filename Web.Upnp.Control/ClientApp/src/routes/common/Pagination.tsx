import H from "history";
import { ChangeEvent, HTMLProps, useCallback, useRef } from "react";
import { useHistory, useLocation } from "react-router";
import { LinkProps, NavLink, RouteLink } from "../../components/NavLink";
import $s from "./Settings";
import { ChevronSvgSymbols } from "./SvgSymbols";

type PageLinkProps = LinkProps & {
    current: boolean
};

type RelativePageLinkProps = LinkProps & {
    enabled: boolean;
    label?: string;
};

type PaginationProps = HTMLProps<HTMLHtmlElement> & {
    total: number;
    pageSize: number;
    current: number;
};

type NavigationProps = {
    location: H.Location;
    history: H.History;
}

const PageLink = ({ current, title, to }: PageLinkProps) => current
    ? <li className="page-item active">
        <span className="page-link">
            {title}<span className="visually-hidden">(current)</span>
        </span>
    </li>
    : <li className="page-item">
        <NavLink to={to} className="page-link">{title}</NavLink>
    </li>;

const RelativePageItem = ({ enabled, title, to, label }: RelativePageLinkProps) => enabled
    ? <li className="page-item">
        <NavLink to={to} className="page-link" aria-label={label}>
            <span aria-hidden="true">{title}</span><span className="visually-hidden">{label}</span>
        </NavLink>
    </li>
    : <li className="page-item disabled">
        <span className="page-link">{title}</span>
    </li>;

export default ({ total, baseUrl, current, pageSize, className, ...other }: PaginationProps & { baseUrl: string }) => {

    const pattern = `${baseUrl}?s=${pageSize}&p=`;

    const items = [];
    for (let i = 1; i <= Math.ceil(total / pageSize); i++) {
        items.push(<PageLink key={`pb-${i}`} title={i.toString()} to={`${pattern}${i}`} current={i === current} />);
    }

    return <nav aria-label="Page navigation" className={`p-2 bg-light${className ? ` ${className}` : ""}`} {...other}>
        <ul className="pagination pagination-sm my-0 justify-content-center flex-wrap">
            <RelativePageItem key="prev" title="&laquo;" label="Previous" to={`${pattern}${current - 1}`} enabled={current > 1} />
            {items}
            <RelativePageItem key="next" title="&raquo;" label="Next" to={`${pattern}${current + 1}`} enabled={current < items.length} />
        </ul>
    </nav>;
}

function noActive() {
    return false;
}

const RelativePageLink = ({ title, to, label, children, className, ...other }: LinkProps & { label?: string }) =>
    <RouteLink to={to} aria-label={label} className={`btn btn-round btn-icon btn-plain${className ? ` ${className}` : ""}`} isActive={noActive} {...other}>
        {children}
        {title && <span aria-hidden="true">{title}</span>}
        {label && <span className="visually-hidden">{label}</span>}
    </RouteLink>;

function getBaseUrl(location: H.Location, pageSize: number) {
    const sp = new window.URLSearchParams(location.search);
    sp.set("s", pageSize.toString());
    sp.delete("p");
    return `${location.pathname}?${sp.toString()}`;
}

export function TablePagination(props: PaginationProps & { pageSizes?: number[] }) {
    const history = useHistory();
    const location = useLocation();

    const ref = useRef({ history, location });
    ref.current = { history, location };

    const changeHandler = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const { location, history } = ref.current;
        const pageSize = parseInt(event.target.value);
        const url = getBaseUrl(location, pageSize);
        $s.set("pageSize", pageSize);
        history.push(url);
    }, []);

    const { total, current, pageSize = $s.get("pageSize"), className, pageSizes = $s.get("pageSizes"), ...other } = props;
    const pattern = `${getBaseUrl(location, pageSize).toString()}&p=`;
    const pages = Math.ceil(total / pageSize);

    return <>
        <ChevronSvgSymbols />
        <label className="text-nowrap text-muted small pe-2 d-none d-md-inline">Items per page</label>
        <select className="form-select form-select-sm me-2 my-0 w-auto" aria-label="Items per page" value={pageSize} onChange={changeHandler} >
            {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-muted small pe-2 overflow-hidden text-wrap lines-2">{(current - 1) * pageSize + 1}-{Math.min(current * pageSize, total)} / {total}</span>
        <nav aria-label="Page navigation" className={`hstack${className ? ` ${className}` : ""}`} {...other}>
            <RelativePageLink to={`${pattern}${1}`} label="First" disabled={current === 1}>
                <svg><use href="#chevron-bar-left" /></svg>
            </RelativePageLink>
            <RelativePageLink to={`${pattern}${current - 1}`} label="Previous" disabled={current === 1}>
                <svg><use href="#chevron-left" /></svg>
            </RelativePageLink>
            <RelativePageLink to={`${pattern}${current + 1}`} label="Next" disabled={current >= pages}>
                <svg><use href="#chevron-right" /></svg>
            </RelativePageLink>
            <RelativePageLink to={`${pattern}${pages}`} label="Last" disabled={current >= pages}>
                <svg><use href="#chevron-bar-right" /></svg>
            </RelativePageLink>
        </nav>
    </>;
}