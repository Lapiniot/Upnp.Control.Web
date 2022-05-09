﻿import "./css/index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RouteLink } from "./components/NavLink";
import { SignalRConnection } from "./components/SignalRConnection";
import HomePage from "./routes/home/Home";
import RendererDevicesPage from "./routes/renderers/Router";
import SettingsPage from "./routes/settings/Settings";
import UmiDevicesPage from "./routes/umi/Router";
import UpnpDevicesPage from "./routes/upnp/Router";
import * as SW from "./serviceWorkerRegistration";

const baseUrl: string = document.getElementsByTagName("base")[0].getAttribute("href") as string;
const container: HTMLElement = document.getElementById("main-root") as HTMLElement;
const root = createRoot(container);

root.render(
    <BrowserRouter basename={baseUrl}>
        <div className="shell">
            <div className="navbar">
                <a className="navbar-brand d-none d-lg-inline" href="/">UPnP Dashboard</a>
                <nav>
                    <RouteLink to="/" glyph="sprites.svg#house-chimney" className="nav-link">Home</RouteLink>
                    <RouteLink to="/upnp" glyph="sprites.svg#network-wired" className="nav-link"><span><span className="d-none d-lg-inline">UPnP&nbsp;</span>Devices</span></RouteLink>
                    <RouteLink to="/renderers" glyph="sprites.svg#tv" className="nav-link"><span><span className="d-none d-lg-inline">Network&nbsp;</span>Players</span></RouteLink>
                    <RouteLink to="/umi" glyph="sprites.svg#radio" className="nav-link"><span><span className="d-none d-lg-inline">Xiaomi&nbsp;</span>Speakers</span></RouteLink>
                    <RouteLink to="/settings" glyph="sprites.svg#gear" className="nav-link">Settings</RouteLink>
                </nav>
            </div>
            <main>
                <div id="notifications-root" className="nt-host gap-3 pe-none" />
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
    </BrowserRouter>);

SW.register();