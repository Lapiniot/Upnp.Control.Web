import "./css/index.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";

import React from "react";
import { Route } from "react-router";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Home from "./routes/home/Home";
import Settings from "./routes/settings/Settings";
import { RouteLink } from "./components/NavLink";
import UpnpRoot from "./routes/upnp/Router";
import UmiRoot from "./routes/umi/Router";
import { SignalRConnection } from "./components/SignalR";

const baseUrl = document.getElementsByTagName("base")[0].getAttribute("href");
const container = document.getElementById("root-view");

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        <div className="container-fluid p-0">
            <div className="row no-gutters">
                <div className="col-auto">
                    <div className="navbar-side navbar-dark bg-gradient-dark">
                        <h5 className="navbar-brand">UPnP Controller</h5>
                        <nav className="navbar-nav">
                            <RouteLink to="/" exact glyph="home" className="nav-item nav-link">Home</RouteLink>
                            <RouteLink to="/umi" glyph="music" className="nav-item nav-link">Network Speakers</RouteLink>
                            <RouteLink to="/upnp" glyph="server" className="nav-item nav-link">UPnP devices</RouteLink>
                            <RouteLink to="/settings" glyph="cog" className="nav-item nav-link">Settings</RouteLink>
                        </nav>
                    </div>
                </div>
                <main className="col">
                    <SignalRConnection hubUrl="/upnpevents">
                        <Route exact path="/" component={Home} />
                        <Route path="/upnp" component={UpnpRoot} />
                        <Route path="/umi" component={UmiRoot} />
                        <Route path="/settings" component={Settings} />
                    </SignalRConnection>
                </main>
            </div>
        </div>
    </BrowserRouter>, container);