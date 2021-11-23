import "./css/index.css";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RouteLink } from "./components/NavLink";
import { SignalRConnection } from "./components/SignalRConnection";
import { ChevronSvgSymbols, NavBarSvgSymbols, UmiActionSvgSymbols, UpnpActionSvgSymbols } from "./routes/common/SvgSymbols";
import HomePage from "./routes/home/Home";
import RendererDevicesPage from "./routes/renderers/Router";
import SettingsPage from "./routes/settings/Settings";
import UmiDevicesPage from "./routes/umi/Router";
import UpnpDevicesPage from "./routes/upnp/Router";
import * as SW from "./serviceWorkerRegistration";

const baseUrl: string = document.getElementsByTagName("base")[0].getAttribute("href") as string;
const container: HTMLElement = document.getElementById("main-root") as HTMLElement;

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        <div className="shell">
            <div className="navbar">
                <a className="navbar-brand d-none d-lg-inline" href="/">UPnP Dashboard</a>
                <nav>
                    <RouteLink to="/" glyph="home" className="nav-link">Home</RouteLink>
                    <RouteLink to="/upnp" glyph="server" className="nav-link"><span><span className="d-none d-lg-inline">UPnP&nbsp;</span>Devices</span></RouteLink>
                    <RouteLink to="/renderers" glyph="tv" className="nav-link"><span><span className="d-none d-lg-inline">Network&nbsp;</span>Players</span></RouteLink>
                    <RouteLink to="/umi" glyph="music" className="nav-link"><span><span className="d-none d-lg-inline">Xiaomi&nbsp;</span>Speakers</span></RouteLink>
                    <RouteLink to="/settings" glyph="cog" className="nav-link">Settings</RouteLink>
                </nav>
                <NavBarSvgSymbols />
            </div>
            <main>
                <div id="notifications-root" className="nt-host gap-3 pe-none" />
                <ChevronSvgSymbols />
                <UpnpActionSvgSymbols />
                <UmiActionSvgSymbols />
                <SignalRConnection hubUrl="/upnpevents">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/index.html" element={<HomePage />} />
                        <Route path="/upnp/*" element={<UpnpDevicesPage />} />
                        <Route path="/renderers/*" element={<RendererDevicesPage />} />
                        <Route path="/umi/*" element={<UmiDevicesPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="*" element={
                            <div className="m-2 text-danger">
                                <h3>404 - Not Found</h3>
                                <h5>Page you are looking for is not found</h5>
                            </div>} />
                    </Routes>
                </SignalRConnection>
            </main>
        </div>
    </BrowserRouter>, container);

SW.register();