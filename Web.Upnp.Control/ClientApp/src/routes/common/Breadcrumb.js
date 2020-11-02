import React from "react";
import { NavLink } from "react-router-dom";
import { reversemap, generatePath } from "../../components/Extensions";

const BreadcrumbItem = ({ disabled, title, url }) => disabled
    ? <li className="breadcrumb-item active" aria-current="page">{title}</li>
    : <li className="breadcrumb-item no-decoration">
        <NavLink to={url}>{title}</NavLink>
    </li>;

export default ({ items = [], path, params, className, disabled }) =>
    <nav aria-label="breadcrumb" className={className}>
        <ol className="breadcrumb my-0 p-1 px-2 bg-gradient">
            {reversemap(items, ({ title, id }, i) => <BreadcrumbItem key={i} title={title !== "" ? title : "..."} url={generatePath(path, { ...params, id })} disabled={disabled || i === 0} />)}
            &nbsp;
        </ol>
    </nav>;