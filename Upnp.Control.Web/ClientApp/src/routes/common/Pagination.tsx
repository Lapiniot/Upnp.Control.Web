import { ChangeEvent, HTMLProps, useCallback, useRef } from "react";
import { createSearchParams, useSearchParams } from "react-router-dom";
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

const RelativePageLink = ({ title, to, label, children, className, ...other }: LinkProps & { label?: string }) =>
    <RouteLink to={to} aria-label={label} className={`btn btn-round btn-icon btn-plain${className ? ` ${className}` : ""}`} {...other}>
        {children}
        {title && <span aria-hidden="true">{title}</span>}
        {label && <span className="visually-hidden">{label}</span>}
    </RouteLink>;

export function TablePagination(props: PaginationProps & { pageSizes?: number[] }) {
    const [search, setSearch] = useSearchParams();

    const ref = useRef({ search, setSearch });
    ref.current = { search, setSearch };

    const changeHandler = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const pageSize = parseInt(event.target.value);
        $s.set("pageSize", pageSize);
        const search: { [K in string]: string } = {};
        ref.current.search.forEach((value, key) => search[key] = value);
        const { s, p, ...init } = search;
        ref.current.setSearch({ ...init, s: pageSize.toString() });
    }, []);

    const { total, current, pageSize = $s.get("pageSize"), className, pageSizes = $s.get("pageSizes"), ...other } = props;
    const pages = Math.ceil(total / pageSize);
    const init: { [K in string]: string } = {};
    search.forEach((value, key) => init[key] = value);

    return <>
        <ChevronSvgSymbols />
        <label className="text-nowrap text-muted small pe-2 d-none d-md-inline">Items per page</label>
        <select className="form-select form-select-sm me-2 my-0 w-auto" aria-label="Items per page" value={pageSize} onChange={changeHandler} >
            {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-muted small pe-2 overflow-hidden text-wrap lines-2">{(current - 1) * pageSize + 1}-{Math.min(current * pageSize, total)} / {total}</span>
        <nav aria-label="Page navigation" className={`hstack${className ? ` ${className}` : ""}`} {...other}>
            <RelativePageLink to={`?${createSearchParams({ ...init, p: "1" })}`} label="First" disabled={current === 1}>
                <svg><use href="#chevron-bar-left" /></svg>
            </RelativePageLink>
            <RelativePageLink to={`?${createSearchParams({ ...init, p: (current - 1).toString() })}`} label="Previous" disabled={current === 1}>
                <svg><use href="#chevron-left" /></svg>
            </RelativePageLink>
            <RelativePageLink to={`?${createSearchParams({ ...init, p: (current + 1).toString() })}`} label="Next" disabled={current >= pages}>
                <svg><use href="#chevron-right" /></svg>
            </RelativePageLink>
            <RelativePageLink to={`?${createSearchParams({ ...init, p: pages.toString() })}`} label="Last" disabled={current >= pages}>
                <svg><use href="#chevron-bar-right" /></svg>
            </RelativePageLink>
        </nav>
    </>
}