import "./css/index.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "@fortawesome/fontawesome-free/js/regular";

import React from "react";
import ReactDOM from "react-dom";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { RouteLink } from "./components/NavLink";
import { SignalRConnection } from "./components/SignalR";
import HomePage from "./routes/home/Home";
import UpnpPage from "./routes/upnp/Router";
import UmiPage from "./routes/umi/Router";
import SettingsPage from "./routes/settings/Settings";

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
                        <Switch>
                            <Route exact path="/" component={HomePage} />
                            <Route path="/upnp" component={UpnpPage} />
                            <Route path="/umi" component={UmiPage} />
                            <Route path="/settings" component={SettingsPage} />
                            <Route path="*" render={() => <div className="m-2 text-danger">
                                <h3>404 - Not Found</h3>
                                <h5>Page you are looking for is not found</h5>
                            </div>} />
                        </Switch>
                    </SignalRConnection>
                </main>
            </div>
        </div>
    </BrowserRouter>,
    container);