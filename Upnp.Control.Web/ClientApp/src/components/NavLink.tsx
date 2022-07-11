import { AnchorHTMLAttributes } from "react";
import { NavLink } from "react-router-dom";
import { useNavigatorClickHandler, useNavigatorResolvedPath } from "./Navigator";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    to: string;
    active?: boolean;
    disabled?: boolean;
    glyph?: string
}

function buildClass(className: string | undefined, active: boolean | undefined, disabled: boolean | undefined) {
    return `${className ?? ""}${active ? " active" : ""}${disabled ? " disabled" : ""}`.trim() || undefined;
}

function Link({ to, glyph, className, active, disabled, children, ...other }: LinkProps) {
    return <a href={!disabled ? to : undefined} className={buildClass(className, active, disabled)} {...other}>
        {glyph && <svg><use href={glyph} /></svg>}{children}
    </a>;
}

function RouteLink({ glyph, className, active, disabled, children, ...other }: LinkProps) {
    return <NavLink className={buildClass(className, active, disabled)} {...other}>
        {glyph && <svg><use href={glyph} /></svg>}{children}
    </NavLink>;
}

function NavigatorLink({ to, ...other }: LinkProps) {
    const { pathname, search, hash } = useNavigatorResolvedPath(to);
    const handler = useNavigatorClickHandler();
    return <Link {...other} to={pathname + hash + search} onClick={handler} />;
}

export { Link, RouteLink, NavigatorLink }