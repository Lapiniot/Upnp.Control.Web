import React from "react";
import { RouteLink } from "./NavLink";

export default class NavBar extends React.Component {

    displayName = NavBar.name;

    render() {
        return <div className="navbar-side navbar-dark bg-gradient-dark">
                   <h5 className="navbar-brand">UPnP Controller</h5>
                   <nav className="navbar-nav">
                       <RouteLink to="/" exact glyph="home" className="nav-item nav-link">Home</RouteLink>
                       <RouteLink to="/browse/umi" glyph="music" className="nav-item nav-link">Network Speakers</RouteLink>
                       <RouteLink to="/browse/upnp" glyph="server" className="nav-item nav-link">UPnP devices</RouteLink>
                       <RouteLink to="/settings" glyph="cog" className="nav-item nav-link">Settings</RouteLink>
                   </nav>
               </div>;
    }
}