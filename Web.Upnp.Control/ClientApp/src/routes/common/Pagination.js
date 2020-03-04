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


export default ({ count, total, baseUrl, current, size, className }) => {

    if (count == 0 || total == count) return null;

    const template = `${baseUrl}?s=${size}&p=`;
    const pageData = [];
    for (let i = 0; i < Math.ceil(total / size); i++) {
        pageData.push({ title: i + 1, url: `${template}${i + 1}` });
    }

    return <nav aria-label="Page navigation" className={merge`position-sticky sticky-bottom p-2 bg-gray-200 ${className}`}>
        <ul className="pagination my-0 justify-content-center flex-wrap">
            <RelativePageLink key="prev" title="&laquo;" label="Previous" url={`${template}${current - 1}`} enabled={current > 1} />
            {[
                pageData.map(({ title, url }, index) => <PageLink key={index + 1} title={title} url={url} current={index + 1 === current} />)
            ]}
            <RelativePageLink key="next" title="&raquo;" label="Next" url={`${template}${current + 1}`} enabled={current < pageData.length} />
        </ul>
    </nav>;
}