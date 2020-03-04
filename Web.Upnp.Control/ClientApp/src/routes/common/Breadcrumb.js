import React from "react";
import { NavLink } from "react-router-dom";
import { reversemap } from "../../components/Extensions";

const BreadcrumbItem = ({ active, title, url }) => active
    ? <li className="breadcrumb-item active" aria-current="page">{title}</li>
    : <li className="breadcrumb-item"><NavLink to={url}>{title}</NavLink></li>;

export default ({ dataContext = [], baseUrl }) =>
    <nav className="position-sticky sticky-top" aria-label="breadcrumb">
        <ol className="breadcrumb rounded-0 my-0 p-2">
            {[
                reversemap(dataContext, ({ title, id }, i) => <BreadcrumbItem key={i} title={title} url={`${baseUrl}/${id}`} active={i === 0} />)
            ]}
        </ol>
    </nav>;