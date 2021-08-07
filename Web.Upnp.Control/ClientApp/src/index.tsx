import "./css/index.css";
import ReactDOM from "react-dom";
import { Redirect, Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { RouteLink } from "./components/NavLink";
import { SignalRConnection } from "./components/SignalR";
import { NavBarSvgSymbols } from "./routes/common/SvgSymbols";
import HomePage from "./routes/home/Home";
import RenderersPage from "./routes/renderers/Router";
import SettingsPage from "./routes/settings/Settings";
import UmiPage from "./routes/umi/Router";
import UpnpPage from "./routes/upnp/Router";
import * as SW from "./serviceWorkerRegistration";

const baseUrl: string = document.getElementsByTagName("base")[0].getAttribute("href") as string;
const container: HTMLElement = document.getElementById("main-root") as HTMLElement;

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        <div className="shell">
            <div className="navbar">
                <a className="navbar-brand d-none d-lg-inline" href="/">UPnP Dashboard</a>
                <nav>
                    <RouteLink to="/" exact glyph="home" className="nav-link">Home</RouteLink>
                    <RouteLink to="/upnp" glyph="server" className="nav-link"><span><span className="d-none d-lg-inline">UPnP&nbsp;</span>Devices</span></RouteLink>
                    <RouteLink to="/renderers" glyph="tv" className="nav-link"><span><span className="d-none d-lg-inline">Network&nbsp;</span>Players</span></RouteLink>
                    <RouteLink to="/umi" glyph="music" className="nav-link"><span><span className="d-none d-lg-inline">Xiaomi&nbsp;</span>Speakers</span></RouteLink>
                    <RouteLink to="/settings" glyph="cog" className="nav-link">Settings</RouteLink>
                </nav>
                <NavBarSvgSymbols />
            </div>
            <main>
                <div id="notifications-root" className="nt-host gap-3 pe-none" />
                <SignalRConnection hubUrl="/upnpevents">
                    <Switch>
                        <Route exact path="/">
                            <HomePage />
                        </Route>
                        <Route path="/:category(upnp)">
                            <UpnpPage />
                        </Route>
                        <Route path="/:category(umi)" component={UmiPage} />
                        <Route path="/:category(renderers)" component={RenderersPage} />
                        <Route path="/settings">
                            <SettingsPage />
                        </Route>
                        <Route path="/index.html">
                            <Redirect to="/" />
                        </Route>
                        <Route path="*">
                            <div className="m-2 text-danger">
                                <h3>404 - Not Found</h3>
                                <h5>Page you are looking for is not found</h5>
                            </div>
                        </Route>
                    </Switch>
                </SignalRConnection>
            </main>
        </div>
    </BrowserRouter>, container);

SW.register();