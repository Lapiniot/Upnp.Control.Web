import { ChangeEvent, HTMLProps, useCallback, useRef } from "react";
import { createSearchParams, useNavigator } from "../../hooks/Navigator";
import { LinkProps, NavigatorLink } from "../../components/NavLink";
import $s from "./Settings";

type PaginationProps = HTMLProps<HTMLHtmlElement> & {
    total: number;
    pageSize: number;
    current: number;
};

function PageLink({ title, to, label, children, className, ...other }: LinkProps & { label?: string; }) {
    return <NavigatorLink to={to} aria-label={label} className={`btn${className ? ` ${className}` : ""}`} {...other}>
        {children}
        {title && <span aria-hidden="true">{title}</span>}
        {label && <span className="visually-hidden">{label}</span>}
    </NavigatorLink>;
}

export default function (props: PaginationProps & { pageSizes?: number[] }) {
    const { navigate, search } = useNavigator();
    const ref = useRef({ navigate, search });
    ref.current = { navigate, search };

    const changeHandler = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const pageSize = parseInt(event.target.value);
        $s.set("pageSize", pageSize);
        const search = new URLSearchParams(ref.current.search);
        search.set("s", pageSize.toString());
        search.delete("p");
        ref.current.navigate({ search: search.toString() });
    }, []);

    const { total, current, pageSize = $s.get("pageSize"), className, pageSizes = $s.get("pageSizes"), ...other } = props;
    const pages = Math.ceil(total / pageSize);
    const init: { [K in string]: string } = {};
    search.forEach((value, key) => init[key] = value);

    return <>
        <label className="text-nowrap small pe-2 d-none d-md-inline">Items per page</label>
        <select className="form-select form-select-sm me-2 my-0 w-auto" aria-label="Items per page" value={pageSize} onChange={changeHandler} >
            {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="small pe-2 text-nowrap">{(current - 1) * pageSize + 1}-{Math.min(current * pageSize, total)} / {total}</span>
        <nav aria-label="Page navigation" className={`hstack toolbar toolbar-compact g-1${className ? ` ${className}` : ""}`} {...other}>
            <PageLink to={`?${createSearchParams({ ...init, p: "1" })}`} label="First" disabled={current === 1}>
                <svg><use href="symbols.svg#first_page" /></svg>
            </PageLink>
            <PageLink to={`?${createSearchParams({ ...init, p: (current - 1).toString() })}`} label="Previous" disabled={current === 1}>
                <svg><use href="symbols.svg#chevron_left" /></svg>
            </PageLink>
            <PageLink to={`?${createSearchParams({ ...init, p: (current + 1).toString() })}`} label="Next" disabled={current >= pages}>
                <svg><use href="symbols.svg#chevron_right" /></svg>
            </PageLink>
            <PageLink to={`?${createSearchParams({ ...init, p: pages.toString() })}`} label="Last" disabled={current >= pages}>
                <svg><use href="symbols.svg#last_page" /></svg>
            </PageLink>
        </nav>
    </>
}