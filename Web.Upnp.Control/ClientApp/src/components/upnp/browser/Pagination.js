import React from "react";
import { NavLink } from "react-router-dom";

class PageLink extends React.Component {
    displayName = PageLink.name;

    render() {

        const { current, title, url, ...other } = this.props;

        if (current)
            return <li className="page-item active" {...other}>
                       <span className="page-link">
                           {title}<span className="sr-only">(current)</span>
                       </span>
                   </li>;
        else
            return <li className="page-item" {...other}>
                       <NavLink to={url} className="page-link">{title}</NavLink>
                   </li>;
    }
}

class RelativePageLink extends React.Component {
    displayName = PageLink.name;

    render() {

        const { enabled, title, url, label, ...other } = this.props;

        if (enabled)
            return <li className="page-item" {...other}>
                       <NavLink to={url} className="page-link" aria-label={label}>
                           <span aria-hidden="true">{title}</span><span className="sr-only">{label}</span>
                       </NavLink>
                   </li>;
        else
            return <li className="page-item disabled" {...other}>
                       <span className="page-link">{title}</span>
                   </li>;
    }
}


export default class Pagination extends React.Component {

    displayName = Pagination.name;

    render() {
        const { "data-context": { result: { length } = [], total = 0 } = {}, baseUrl, page, size } = this.props;

        if (length === 0 || total === length)
            return null;

        const template = `${baseUrl}?s=${size}&p=`;
        const pageData = [];
        for (let i = 0; i < Math.ceil(total / size); i++) {
            pageData.push({ title: i + 1, url: `${template}${i + 1}` });
        }

        return <nav aria-label="Page navigation" className="position-sticky sticky-bottom p-2 bg-gray-200">
                   <ul className="pagination my-0 justify-content-center flex-wrap">
                       <RelativePageLink key="prev" title="&laquo;" label="Previous" url={`${template}${page - 1}`} enabled={page > 1} />
                       {[
                           pageData.map((e, index) => <PageLink key={index + 1} title={e.title} url={e.url} current={index + 1 === page} />)
                       ]}
                       <RelativePageLink key="next" title="&raquo;" label="Next" url={`${template}${page + 1}`} enabled={page < pageData.length} />
                   </ul>
               </nav>;
    }
}