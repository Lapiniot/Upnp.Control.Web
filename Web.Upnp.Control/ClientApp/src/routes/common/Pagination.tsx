import React, { HTMLProps } from "react";
import { NavLink } from "react-router-dom";

type LinkProps = {
    title: string | number;
    url: string;
};

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
    baseUrl: string;
};

const PageLink = ({ current, title, url }: PageLinkProps) => current
    ? <li className="page-item active">
        <span className="page-link">
            {title}<span className="visually-hidden">(current)</span>
        </span>
    </li>
    : <li className="page-item">
        <NavLink to={url} className="page-link">{title}</NavLink>
    </li>;

const RelativePageLink = ({ enabled, title, url, label }: RelativePageLinkProps) => enabled
    ? <li className="page-item">
        <NavLink to={url} className="page-link" aria-label={label}>
            <span aria-hidden="true">{title}</span><span className="visually-hidden">{label}</span>
        </NavLink>
    </li>
    : <li className="page-item disabled">
        <span className="page-link">{title}</span>
    </li>;

export default ({ total, baseUrl, current, pageSize, className, ...other }: PaginationProps) => {

    const pattern = `${baseUrl}?s=${pageSize}&p=`;

    const items = [];
    for (let i = 1; i <= Math.ceil(total / pageSize); i++) {
        items.push(<PageLink key={`pb-${i}`} title={i} url={`${pattern}${i}`} current={i === current} />);
    }

    return <nav aria-label="Page navigation" className={`p-2 bg-light${className ? ` ${className}` : ""}`} {...other}>
        <ul className="pagination pagination-sm my-0 justify-content-center flex-wrap">
            <RelativePageLink key="prev" title="&laquo;" label="Previous" url={`${pattern}${current - 1}`} enabled={current > 1} />
            {items}
            <RelativePageLink key="next" title="&raquo;" label="Next" url={`${pattern}${current + 1}`} enabled={current < items.length} />
        </ul>
    </nav>;
}