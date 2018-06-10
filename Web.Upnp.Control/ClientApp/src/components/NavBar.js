import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class NavBar extends Component {
    displayName = NavBar.name;

    render() {
        return (
            <nav class="navbar navbar-dark flex-sm-column bg-dark navbar-inverse navbar-fixed-top">
                <span class="navbar-brand">UPnP Controller</span>
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item"><Link to={'/'} class="nav-link">Home</Link></li>
                    <li class="nav-item"><Link to={'/umi'} class="nav-link">Network Speakers</Link></li>
                    <li class="nav-item"><Link to={'/upnp'} class="nav-link">UPnP devices</Link></li>
                    <li class="nav-item"><Link to={'/settings'} class="nav-link">Settings</Link></li>
                </ul>
            </nav>
        );
    }
}