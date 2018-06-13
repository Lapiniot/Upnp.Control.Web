import React from 'react';
import RouteLink  from './NavLink';

export class NavBar extends React.Component {
    displayName = NavBar.name;

    render() {
        return (
            <nav class="navbar navbar-dark bg-gradient-dark flex-column align-items-start justify-content-start pt-0">
                <a class="navbar-brand" href="/">UPnP Controller</a>
                <ul class="navbar-nav mr-auto">
                    <RouteLink to='/' exact glyph="home">Home</RouteLink>
                    <RouteLink to='/umi' glyph="music">Network Speakers</RouteLink>
                    <RouteLink to='/upnp' glyph="server">UPnP devices</RouteLink>
                    <RouteLink to='/settings' glyph="cogs">Settings</RouteLink>
                </ul>
            </nav>
        );
    }
}