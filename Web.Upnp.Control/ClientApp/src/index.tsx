import "./css/index.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";

import React from "react";
import ReactDOM from "react-dom";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { RouteLink } from "./components/NavLink";
import { SignalRConnection } from "./components/SignalR";
import HomePage from "./routes/home/Home";
import UpnpPage from "./routes/upnp/Router";
import UmiPage from "./routes/umi/Router";
import PlayersPage from "./routes/renderers/Router";
import SettingsPage from "./routes/settings/Settings";

const baseUrl: string = document.getElementsByTagName("base")[0].getAttribute("href") as string;
const container: HTMLElement = document.getElementById("root-view") as HTMLElement;

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        <div className="p-0">
            <div className="row g-0 flex-nowrap">
                <div className="col-auto">
                    <div className="navbar position-sticky sticky-left flex-column justify-content-start navbar-dark bg-dark bg-gradient px-3">
                        <h5 className="navbar-brand mx-0">UPnP Controller</h5>
                        <nav className="navbar-nav">
                            <RouteLink to="/" exact glyph="home" className="nav-item nav-link">Home</RouteLink>
                            <RouteLink to="/upnp" glyph="server" className="nav-item nav-link">UPnP devices</RouteLink>
                            <RouteLink to="/players" glyph="tv" className="nav-item nav-link">Network Players</RouteLink>
                            <RouteLink to="/umi" glyph="music" className="nav-item nav-link">Xiaomi Speakers</RouteLink>
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
                            <Route path="/players" component={PlayersPage} />
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
    </BrowserRouter>, container);