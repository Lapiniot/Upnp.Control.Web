import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class NavBar extends Component {
    displayName = NavBar.name;

    render() {
        return (
            <nav class="nav nav-pills flex-column flex-sm-row">
                <li class="nav-item"><Link to={'/'} class="flex-sm-fill nav-link">Home</Link></li>
                <li class="nav-item"><Link to={'/umi'} class="flex-sm-fill nav-link">Network Speakers</Link></li>
                <li class="nav-item"><Link to={'/upnp'} class="flex-sm-fill nav-link">UPnP devices</Link></li>
                <li class="nav-item"><Link to={'/settings'} class="flex-sm-fill nav-link">Settings</Link></li>
            </nav>
        );
    }
}