import React from "react";
import { RouteLink } from "./NavLink";

export default class NavBar extends React.Component {

    displayName = NavBar.name;

    render() {
        return <div className="navbar-side navbar-dark bg-gradient-dark">
                   <h5 className="navbar-brand">UPnP Controller</h5>
                   <nav className="navbar-nav">
                       <RouteLink to="/" exact glyph="home">Home</RouteLink>
                       <RouteLink to="/umi" glyph="music">Network Speakers</RouteLink>
                       <RouteLink to="/upnp" glyph="server">UPnP devices</RouteLink>
                       <RouteLink to="/settings" glyph="cog">Settings</RouteLink>
                   </nav>
               </div>;
    }
}