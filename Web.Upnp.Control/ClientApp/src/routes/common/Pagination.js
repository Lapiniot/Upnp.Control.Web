import React from "react";
import { NavLink } from "react-router-dom";
import { mergeClassNames as merge } from "../../components/Extensions.js";

const PageLink = ({ current, title, url, ...other }) => current
    ? <li className="page-item active" {...other}>
        <span className="page-link">
            {title}<span className="sr-only">(current)</span>
        </span>
    </li>
    : <li className="page-item" {...other}>
        <NavLink to={url} className="page-link">{title}</NavLink>
    </li>;

const RelativePageLink = ({ enabled, title, url, label, ...other }) => enabled ?
    <li className="page-item" {...other}>
        <NavLink to={url} className="page-link" aria-label={label}>
            <span aria-hidden="true">{title}</span><span className="sr-only">{label}</span>
        </NavLink>
    </li>
    : <li className="page-item disabled" {...other}>
        <span className="page-link">{title}</span>
    </li>;


export default ({ count, total, url, current, size, className }) => {

    if (count === 0 || total === count) return null;

    const pattern = `${url}?s=${size}&p=`;

    const items = [];
    for (let i = 1; i <= Math.ceil(total / size); i++) {
        items.push(<PageLink key={`pb-${i}`} title={i} url={`${pattern}${i}`} current={i === current} />);
    }

    return <nav aria-label="Page navigation" className={merge`p-2 bg-gray-200 ${className}`}>
        <ul className="pagination pagination-sm my-0 justify-content-center flex-wrap">
            <RelativePageLink key="prev" title="&laquo;" label="Previous" url={`${pattern}${current - 1}`} enabled={current > 1} />
            {items}
            <RelativePageLink key="next" title="&raquo;" label="Next" url={`${pattern}${current + 1}`} enabled={current < items.length} />
        </ul>
    </nav>;
}