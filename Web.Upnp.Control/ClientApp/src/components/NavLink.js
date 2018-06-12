import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class NavLink extends Component {

    renderIcon(icon) {
        return icon && <i class={"fa fa-fw fa-" + icon} />;
    }

    renderLink(props) {
        const { to, icon, className, title, children, ...other } = props;
        return <a href={to} class={"nav-link" + (className ? " " + className : "")} {...other}>{this.renderIcon(icon)}{title || children}</a>
    }

    render() {
        return <li class="nav-item">{this.renderLink(this.props)}</li>;
    }
}

export class RouteLink extends NavLink {

    renderLink(props) {
        const { to, icon, active, disabled, className, title, children, ...other } = props;
        let c = "nav-link";
        c += disabled && " disabled" || "";
        c += active && " active" || "";
        c += className && " " + className || "";
        return <Link to={to} class={c} {...other}>{this.renderIcon(icon)}{title || children}</Link>
    }
}