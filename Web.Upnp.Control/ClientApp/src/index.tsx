import "./css/index.css";
import React from "react";
import ReactDOM from "react-dom";
import { Redirect, Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { RouteLink } from "./components/NavLink";
import { SignalRConnection } from "./components/SignalR";
import HomePage from "./routes/home/Home";
import UpnpPage from "./routes/upnp/Router";
import UmiPage from "./routes/umi/Router";
import RenderersPage from "./routes/renderers/Router";
import SettingsPage from "./routes/settings/Settings";
import { NavBarSvgSymbols } from "./routes/common/SvgSymbols";
import * as SWRegistration from "./serviceWorkerRegistration";

const baseUrl: string = document.getElementsByTagName("base")[0].getAttribute("href") as string;
const container: HTMLElement = document.getElementById("main-root") as HTMLElement;

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        <div className="vh-100 d-flex flex-column flex-sm-row">
            <div className="navbar navbar-expand navbar-dark bg-dark bg-gradient p-0 order-1 order-sm-0 flex-sm-column justify-content-start align-items-stretch">
                <a className="navbar-brand d-none d-lg-inline ps-3" href="/">UPnP Dashboard</a>
                <nav className="navbar-nav bottom-bar nav-rail-sm wide-lg p-sm-1 flex-sm-grow-0">
                    <RouteLink to="/" exact glyph="home" className="nav-link">Home</RouteLink>
                    <RouteLink to="/upnp" glyph="server" className="nav-link"><span><span className="d-none d-lg-inline">UPnP&nbsp;</span>Devices</span></RouteLink>
                    <RouteLink to="/renderers" glyph="tv" className="nav-link"><span><span className="d-none d-lg-inline">Network&nbsp;</span>Players</span></RouteLink>
                    <RouteLink to="/umi" glyph="music" className="nav-link"><span><span className="d-none d-lg-inline">Xiaomi&nbsp;</span>Speakers</span></RouteLink>
                    <RouteLink to="/settings" glyph="cog" className="nav-link">Settings</RouteLink>
                </nav>
                <NavBarSvgSymbols />
            </div>
            <main className="h-100 overflow-hidden position-relative order-0 order-sm-1 flex-grow-1">
                <SignalRConnection hubUrl="/upnpevents">
                    <Switch>
                        <Route exact path="/" component={HomePage} />
                        <Route path="/:category(upnp)" component={UpnpPage} />
                        <Route path="/:category(umi)" component={UmiPage} />
                        <Route path="/:category(renderers)" component={RenderersPage} />
                        <Route path="/settings" component={SettingsPage} />
                        <Route path="/index.html" render={() => <Redirect to="/" />} />
                        <Route path="*" render={() => <div className="m-2 text-danger">
                            <h3>404 - Not Found</h3>
                            <h5>Page you are looking for is not found</h5>
                        </div>} />
                    </Switch>
                </SignalRConnection>
            </main>
        </div>
    </BrowserRouter>, container);

SWRegistration.register();