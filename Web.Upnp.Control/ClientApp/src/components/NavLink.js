import React from "react";
import { NavLink as RNavLink } from "react-router-dom";
import Icon from "./Icon";

class LinkTemplate extends React.Component {
    render() {
        const { type: Tag, className, active, disabled, glyph, title, children, ...other } = this.props;
        const finalClass = [className, active && "active", disabled && "disabled"]
            .filter(v => !!v).join(" ");
        return <Tag className={finalClass} {...other}>
                   <Icon glyph={glyph} className="x-fa-w-2" />{title}{children}
               </Tag>;
    }
}

export class NavLink extends React.Component {

    displayName = NavLink.name;

    render() {
        const { to, ...other } = this.props;
        return <LinkTemplate type={"a"} href={to} {...other} />;
    }
}

export class RouteLink extends React.Component {

    displayName = RouteLink.name;

    render() {
        return <LinkTemplate type={RNavLink} {...this.props} />;
    }
}