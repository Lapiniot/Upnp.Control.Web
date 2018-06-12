import React, { Component } from 'react';
import { NavLink, RouteLink } from './NavLink';

export class NavBar extends Component {
    displayName = NavBar.name;

    render() {
        return (
            <nav class="navbar navbar-light bg-light flex-column align-items-start justify-content-start">
                <a class="navbar-brand" href="/">UPnP Controller</a>
                <ul class="navbar-nav mr-auto">
                    <RouteLink to='/' exact glyph="home" active>Home</RouteLink>
                    <RouteLink to='/umi' glyph="music">Network Speakers</RouteLink>
                    <RouteLink to='/upnp' glyph="server">UPnP devices</RouteLink>
                    <RouteLink to='/settings' glyph="cogs" disabled>Settings</RouteLink>
                </ul>
            </nav>
        );
    }
}