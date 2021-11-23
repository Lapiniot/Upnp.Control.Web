import { HTMLAttributes } from "react";
import { NavLink } from "react-router-dom";
import { reversemap } from "../../components/Extensions";

type BreadcrumbItemProps = {
    title: string;
    url: string;
    disabled?: boolean;
};

type BreadcrumbParams = {
    items?: { title: string; id: string; }[];
    disabled?: boolean;
};

const ItemTemplate = ({ disabled, title, url }: BreadcrumbItemProps) => disabled
    ? <li className="breadcrumb-item active" aria-current="page">{title}</li>
    : <li className="breadcrumb-item text-decoration-none">
        <NavLink className="text-decoration-none" to={url}>{title}</NavLink>
    </li>;

export default ({ items = [], disabled, ...other }: BreadcrumbParams & HTMLAttributes<HTMLDivElement>) => {
    return <nav aria-label="breadcrumb" {...other}>
        <ol className="breadcrumb my-0 p-1 px-2 bg-white bg-gradient">
            {reversemap(items, ({ title, id }, i) => <ItemTemplate key={i} title={title !== "" ? title : "..."} url={`../${id}`} disabled={disabled || i === 0} />)}
            &nbsp;
        </ol>
    </nav>
}