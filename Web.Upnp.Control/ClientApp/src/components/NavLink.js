import React from 'react';
import { NavLink as RNavLink } from 'react-router-dom';
import Icon from './Icon';

class LinkTemplate extends React.Component {
    render() {
        const { type: LinkElement, class: classAttr, className, active, disabled, glyph, title, children, ...other } = this.props;
        const finalClass = ['nav-link', classAttr, className, active && 'active', disabled && 'disabled'].
            filter(v => !!v).join(' ');
        return <li className="nav-item"><LinkElement className={finalClass} {...other}><Icon glyph={glyph} />{title}{children}</LinkElement></li>;
    }
}

export class NavLink extends React.Component {

    render() {
        const { to, ...other } = this.props;
        return <LinkTemplate type={'a'} href={to} {...other} />
    }
}

export class RouteLink extends React.Component {

    render() {
        return <LinkTemplate type={RNavLink} {...this.props} />
    }
}