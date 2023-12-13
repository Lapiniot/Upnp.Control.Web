import { AnchorHTMLAttributes } from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
import { useNavigatorClickHandler, useNavigatorResolvedPath } from "../hooks/Navigator";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    to: string | undefined;
    disabled?: boolean;
    glyph?: string
}

export function Link({ to, glyph, className, disabled, children, ...other }: LinkProps) {
    const content = <>{glyph && <svg><use href={glyph} /></svg>}{children}</>;
    return !disabled && to
        ? <a href={to} className={className} {...other}>{content}</a>
        : <span className={`link-placeholder disabled${className ? ` ${className}` : ""}`}>{content}</span>
}

export function RouteLink({ glyph, className, disabled, children, to, ...other }: Omit<NavLinkProps, "to"> & LinkProps) {
    const content = <>{glyph && <svg><use href={glyph} /></svg>}{children}</>;
    return !disabled && to
        ? <NavLink to={to} className={className} {...other}>{content}</NavLink>
        : <span className={`link-placeholder disabled${className ? ` ${className}` : ""}`}>{content}</span>
}

export function NavigatorLink({ to = "#", ...other }: LinkProps) {
    const { pathname, search, hash } = useNavigatorResolvedPath(to);
    const handler = useNavigatorClickHandler();
    return <Link {...other} to={pathname + hash + search} onClick={handler} />
}