import React from "react";
import { NavLink } from "react-router-dom";
import { reversemap, generatePath } from "../../components/Extensions";

const BreadcrumbItem = ({ active, title, url }) => active
    ? <li className="breadcrumb-item active" aria-current="page">{title}</li>
    : <li className="breadcrumb-item"><NavLink to={url}>{title}</NavLink></li>;

export default ({ items = [], path, params }) =>
    <nav aria-label="breadcrumb">
        <ol className="breadcrumb rounded-0 my-0 p-2">
            {reversemap(items, ({ title, id }, i) => <BreadcrumbItem key={i} title={title} url={generatePath(path, { ...params, id })} active={i === 0} />)}
            &nbsp;
        </ol>
    </nav>;