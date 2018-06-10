import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class NavBar extends Component {
    displayName = NavBar.name;

    render() {
        return (
            <nav class="navbar navbar-dark bg-dark flex-column justify-content-start align-items-stretch">
                <div class="navbar-brand">UPnP Controller</div>
                <ul class="navbar-nav">
                    <li class="nav-item fa fa-home"><Link to={'/'} class="nav-link">Home</Link></li>
                    <li class="nav-item fa fa-music"><Link to={'/umi'} class="nav-link">Network Speakers</Link></li>
                    <li class="nav-item fa fa-server"><Link to={'/upnp'} class="nav-link">UPnP devices</Link></li>
                    <li class="nav-item fa fa-cogs"><Link to={'/settings'} class="nav-link">Settings</Link></li>
                </ul>
            </nav>
        );
    }
}