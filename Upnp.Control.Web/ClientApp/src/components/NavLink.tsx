import { AnchorHTMLAttributes } from "react";
import { NavLink as RNavLink } from "react-router-dom";
import { useNavigatorClickHandler, useNavigatorResolvedPath } from "./Navigator";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    to: string;
    active?: boolean;
    disabled?: boolean;
    glyph?: string
}

function buildClass(className: string | undefined, active: boolean | undefined, disabled: boolean | undefined) {
    return `${className ? className : ""}${active ? " active" : ""}${disabled ? " disabled" : ""}`.trim();
}

function Link({ to, glyph, className, active, disabled, children, ...other }: LinkProps) {
    return <a href={!disabled ? to : undefined} className={buildClass(className, active, disabled)} {...other}>
        {glyph && <svg className="icon"><use href={glyph} /></svg>}{children}
    </a>;
}

function RouteLink({ glyph, className, active, disabled, children, ...other }: LinkProps) {
    return <RNavLink className={buildClass(className, active, disabled)} {...other}>
        {glyph && <svg className="icon"><use href={glyph} /></svg>}{children}
    </RNavLink>;
}

function NavigatorLink({ to, ...other }: LinkProps) {
    const { pathname, search, hash } = useNavigatorResolvedPath(to);
    const handler = useNavigatorClickHandler();
    return <Link {...other} to={pathname + hash + search} onClick={handler} />;
}

export { Link, RouteLink, NavigatorLink }