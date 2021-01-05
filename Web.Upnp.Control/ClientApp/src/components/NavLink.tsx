import React, { AnchorHTMLAttributes, ElementType, HTMLAttributes } from "react";
import { NavLink as RNavLink, NavLinkProps } from "react-router-dom";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    active?: boolean;
    disabled?: boolean;
    glyph?: string
}

function BuildClass(className: string | undefined, active: boolean | undefined, disabled: boolean | undefined) {
    return `nav-link ${className ? ` ${className}` : ""}${active ? " active" : ""}${disabled ? " disabled" : ""}`;
}

const LinkTemplate = ({ component: Tag, className, active, disabled, glyph, children, ...other }:
    LinkProps & HTMLAttributes<HTMLElement> & { component: ElementType }) =>
    <Tag className={BuildClass(className, active, disabled)} {...other}>
        {glyph && <i className={`fas fa-fw fa-${glyph}`} />}{children}
    </Tag>;


const NavLink = ({ to, ...other }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps) =>
    <LinkTemplate component="a" href={to} {...other} />;

const RouteLink = (props: NavLinkProps & LinkProps) =>
    <LinkTemplate component={RNavLink} {...props} />;

export { NavLink, RouteLink }