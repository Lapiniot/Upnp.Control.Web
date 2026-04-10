import { NavigatorLink } from "@components/NavLink";
import { reversemap } from "@services/Extensions";
import { type HTMLAttributes } from "react";

type BreadcrumbParams = {
    items?: { title: string; id: string; }[];
    disabled?: boolean;
};

export default function Breadcrumb({ items = [], disabled, ...other }: BreadcrumbParams & HTMLAttributes<HTMLDivElement>) {
    return <nav aria-label="breadcrumb" {...other}>
        <ol className="breadcrumb my-0 p-1 px-2">
            {reversemap(items, ({ title, id }, i) => disabled || i === 0
                ? <li className="breadcrumb-item active" aria-current="page" key={i}>{title}</li>
                : <li className="breadcrumb-item text-decoration-none" key={i}>
                    <NavigatorLink className="text-decoration-none" to={`../${id}`}>{title}</NavigatorLink>
                </li>)}
            &nbsp;
        </ol>
    </nav>
}