import React from "react";
import { NavLink } from "react-router-dom";
import { reversemap } from "../../Extensions";

class BreadcrumbItem extends React.Component {
    displayName = Breadcrumb.name;

    render() {

        const { active, title, url } = this.props;

        if (active)
            return <li className="breadcrumb-item active" aria-current="page">{title}</li>;
        else
            return <li className="breadcrumb-item">
                       <NavLink to={url}>{title}</NavLink>
                   </li>;
    }
}

export default class Breadcrumb extends React.Component {

    displayName = Breadcrumb.name;

    render() {
        const { "data-context": { parents } = [], urls: { root: baseUrl } = {} } = this.props;
        return <nav className="position-sticky sticky-top" aria-label="breadcrumb">
                   <ol className="breadcrumb rounded-0 my-0 p-2">
                       {[
                           reversemap(parents, (p, i) => <BreadcrumbItem key={i} title={p.title} url={`${baseUrl}/${p.id}`} active={i === parents.length - 1} />)
                       ]}
                   </ol>
               </nav>;
    }
}