import React from "react";
import { NavLink } from "react-router-dom";

export default class Breadcrumbs extends React.Component {
    render() {
        const { "data-context": { parents } = [], baseUrl } = this.props;
        return <nav aria-label="breadcrumb sticky-top">
            <ol className="breadcrumb rounded-0 my-0 p-1">
                {[parents.reverse().map((p, i) => {
                    let isCurrent = i === parents.length - 1;
                    let className = "breadcrumb-item" + (isCurrent ? " active" : "");
                    return <li key={i} className={className} aria-current={isCurrent ? "page" : null}>
                        {!isCurrent ? <NavLink to={`${baseUrl}/${p.id}`}>{p.title}</NavLink> : p.title}
                    </li>;
                })]}
            </ol>
        </nav>;
    }
}