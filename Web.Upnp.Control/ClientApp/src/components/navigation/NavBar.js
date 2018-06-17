import React from 'react';
import {RouteLink} from './NavLink';

export default class NavBar extends React.Component {
    
    displayName = NavBar.name;

    render() {
        return (
            <div class="navbar-side navbar-dark bg-gradient-dark">
                <h5 class="navbar-brand">UPnP Controller</h5>
                <nav class="navbar-nav">
                    <RouteLink to='/' exact glyph="home">Home</RouteLink>
                    <RouteLink to='/umi' glyph="music">Network Speakers</RouteLink>
                    <RouteLink to='/upnp' glyph="server">UPnP devices</RouteLink>
                    <RouteLink to='/settings' glyph="cogs">Settings</RouteLink>
                </nav>
            </div>
        );
    }
}