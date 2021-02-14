import "./css/index.css";
import React from "react";
import ReactDOM from "react-dom";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { RouteLink } from "./components/NavLink";
import { SignalRConnection } from "./components/SignalR";
import HomePage from "./routes/home/Home";
import UpnpPage from "./routes/upnp/Router";
import UmiPage from "./routes/umi/Router";
import RenderersPage from "./routes/renderers/Router";
import SettingsPage from "./routes/settings/Settings";
import { NavBarSvgSymbols } from "./routes/common/SvgSymbols";

const baseUrl: string = document.getElementsByTagName("base")[0].getAttribute("href") as string;
const container: HTMLElement = document.getElementById("main-root") as HTMLElement;

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        <div className="vh-100 d-flex flex-column flex-lg-row">
            <div className="navbar navbar-expand navbar-dark bg-dark bg-gradient p-0 order-1 order-lg-0 flex-lg-column justify-content-start">
                <a className="navbar-brand d-none d-lg-inline ps-3" href="/">UPnP RUI</a>
                <nav className="navbar-nav bottom-bar nav-rail-lg p-lg-1 flex-lg-grow-0">
                    <RouteLink to="/" exact glyph="home" className="nav-link">Home</RouteLink>
                    <RouteLink to="/upnp" glyph="server" className="nav-link">Devices</RouteLink>
                    <RouteLink to="/renderers" glyph="tv" className="nav-link">Players</RouteLink>
                    <RouteLink to="/umi" glyph="music" className="nav-link">Speakers</RouteLink>
                    <RouteLink to="/settings" glyph="cog" className="nav-link">Settings</RouteLink>
                </nav>
                <NavBarSvgSymbols />
            </div>
            <main className="h-100 overflow-hidden position-relative order-0 order-lg-1 flex-grow-1">
                <div className="h-100 overflow-auto d-flex flex-column">
                    <SignalRConnection hubUrl="/upnpevents">
                        <Switch>
                            <Route exact path="/" component={HomePage} />
                            <Route path="/:category(upnp)" component={UpnpPage} />
                            <Route path="/:category(umi)" component={UmiPage} />
                            <Route path="/:category(renderers)" component={RenderersPage} />
                            <Route path="/settings" component={SettingsPage} />
                            <Route path="*" render={() => <div className="m-2 text-danger">
                                <h3>404 - Not Found</h3>
                                <h5>Page you are looking for is not found</h5>
                            </div>} />
                        </Switch>
                    </SignalRConnection>
                </div>
            </main>
        </div>
    </BrowserRouter>, container);