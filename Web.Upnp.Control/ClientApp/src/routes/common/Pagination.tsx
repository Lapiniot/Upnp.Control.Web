import React, { ChangeEvent, HTMLProps } from "react";
import { LinkProps, NavLink, RouteLink } from "../../components/NavLink";
import { PaginationSvgSymbols } from "./SvgSymbols";
import $c from "./Config";
import H from "history";

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
    <RouteLink to={to} aria-label={label} className={`btn btn-round${className ? ` ${className}` : ""}`} isActive={noActive} {...other}>
        {children}
        {title && <span aria-hidden="true">{title}</span>}
        {label && <span className="visually-hidden">{label}</span>}
    </RouteLink>;

export class TablePagination extends React.Component<PaginationProps & NavigationProps & { pageSizes?: number[] }> {

    private pageSizeChangedHandler = (event: ChangeEvent<HTMLSelectElement>) => {
        const url = this.getBaseUrl(event.target.value);
        this.props.history.push(url);
    }

    private getBaseUrl(pageSize: number | string) {
        const sp = new window.URLSearchParams(this.props.location.search);
        sp.set("s", pageSize.toString());
        sp.delete("p");
        return `${this.props.location.pathname}?${sp.toString()}`;
    }

    render() {
        const { total, current, pageSize, className, pageSizes = $c.pageSizes, ...other } = this.props;

        const pattern = `${this.getBaseUrl(pageSize).toString()}&p=`;
        const pages = Math.ceil(total / pageSize);

        return <nav aria-label="Page navigation" className={`d-flex flex-shrink-0 align-items-center${className ? ` ${className}` : ""}`} {...other}>
            <PaginationSvgSymbols />
            <label className="text-nowrap small me-2">Items per page</label>
            <select className="form-select form-select-sm me-4 my-0" aria-label="Items per page" value={pageSize} onChange={this.pageSizeChangedHandler} >
                {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="me-4 small text-nowrap">{(current - 1) * pageSize + 1}-{Math.min(current * pageSize, total)} of {total}</span>
            <RelativePageLink to={`${pattern}${1}`} label="First" disabled={current === 1}>
                <svg xmlns="http://www.w3.org/2000/svg">
                    <use href="#chevron-bar-left" />
                </svg>
            </RelativePageLink>
            <RelativePageLink to={`${pattern}${current - 1}`} label="Previous" disabled={current === 1}>
                <svg xmlns="http://www.w3.org/2000/svg">
                    <use href="#chevron-left" />
                </svg>
            </RelativePageLink>
            <RelativePageLink to={`${pattern}${current + 1}`} label="Next" disabled={current >= pages}>
                <svg xmlns="http://www.w3.org/2000/svg">
                    <use href="#chevron-right" />
                </svg>
            </RelativePageLink>
            <RelativePageLink to={`${pattern}${pages}`} label="Last" disabled={current >= pages}>
                <svg xmlns="http://www.w3.org/2000/svg">
                    <use href="#chevron-bar-right" />
                </svg>
            </RelativePageLink>
        </nav>;
    }
}