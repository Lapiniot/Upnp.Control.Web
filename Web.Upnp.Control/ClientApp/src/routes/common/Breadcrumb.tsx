import { HTMLAttributes } from "react";
import { NavLink } from "react-router-dom";
import { reversemap, generatePath } from "../../components/Extensions";

type BreadcrumbItemProps = {
    title: string;
    url: string;
    disabled?: boolean;
};

type BreadcrumbParams = {
    items?: { title: string; id: string; }[];
    path: string;
    params: { [key: string]: any };
    disabled?: boolean;
};

const ItemTemplate = ({ disabled, title, url }: BreadcrumbItemProps) => disabled
    ? <li className="breadcrumb-item active" aria-current="page">{title}</li>
    : <li className="breadcrumb-item text-decoration-none">
        <NavLink to={url}>{title}</NavLink>
    </li>;

export default ({ items = [], path, params, className, disabled }: BreadcrumbParams & HTMLAttributes<HTMLDivElement>) =>
    <nav aria-label="breadcrumb" className={className}>
        <ol className="breadcrumb my-0 p-1 px-2 bg-light bg-gradient">
            {reversemap(items, ({ title, id }, i) => <ItemTemplate key={i} title={title !== "" ? title : "..."} url={generatePath(path, { ...params, id })} disabled={disabled || i === 0} />)}
            &nbsp;
        </ol>
    </nav>;