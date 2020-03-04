import React from "react";
import { NavLink as RNavLink } from "react-router-dom";
import { mergeClassNames as merge } from "./Extensions"

const LinkTemplate = ({ type: Tag, className, active, disabled, glyph, title, children, ...other }) =>
    <Tag className={merge`${className} ${active && "active"} ${disabled && "disabled"}`} {...other}>
        {glyph && <i className={`fas x-fa-w-2 fa-${glyph}`} />}{title}{children}
    </Tag>;


const NavLink = ({ to, ...other }) => <LinkTemplate type={"a"} href={to} {...other} />;

const RouteLink = (props) => <LinkTemplate type={RNavLink} {...props} />;

export { NavLink, RouteLink }