import { AnchorHTMLAttributes } from "react";
import { NavLink as RNavLink, NavLinkProps } from "react-router-dom";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    to: string;
    active?: boolean;
    disabled?: boolean;
    glyph?: string
}

function BuildClass(className: string | undefined, active: boolean | undefined, disabled: boolean | undefined) {
    return `nav-link${className ? ` ${className}` : ""}${active ? " active" : ""}${disabled ? " disabled" : ""}`;
}

const NavLink = ({ to, glyph, className, active, disabled, children, ...other }: LinkProps) =>
    <a href={!disabled ? to : undefined} className={BuildClass(className, active, disabled)} {...other}>
        {glyph && <i className={`fas fa-fw fa-${glyph}`} />}{children}
    </a>;

const RouteLink = ({ glyph, className, active, disabled, children, ...other }: NavLinkProps & LinkProps) => {
    return <RNavLink className={BuildClass(className, active, disabled)} {...other}>
        {glyph && <i className={`fas fa-fw fa-${glyph}`} />}{children}
    </RNavLink>;
}

export { NavLink, RouteLink }