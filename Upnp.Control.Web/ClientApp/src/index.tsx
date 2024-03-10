import "./styles/index.scss";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./GlobalConfig";
import { RouteLink } from "./components/NavLink";
import { SignalRConnection } from "./components/SignalRConnection";
import { ThemeProvider } from "./routes/common/ThemeContext";
import { AppInfo } from "./routes/common/AppInfo";
import HomePage from "./routes/home/Home";
import RendererDevicesPage from "./routes/renderers/Router";
import SettingsPage from "./routes/settings/Settings";
import UmiDevicesPage from "./routes/umi/Router";
import UpnpDevicesPage from "./routes/upnp/Router";
import * as SW from "./serviceWorkerRegistration";
import { DeviceDiscoveryNotifier } from "./routes/common/DeviceDiscoveryNotifier";
import $s from "./routes/common/Settings";
import { PlaybackStateNotifier } from "./routes/common/PlaybackStateNotifier";
import { ThemeSwitch } from "./routes/common/ThemeSwitch";

const baseUrl = document.getElementsByTagName("base")[0].getAttribute("href")!;
const container = document.getElementById("main-root")!;
const root = createRoot(container);

function shouldShowDiscoveryNotifications() {
    return $s.get("showDiscoveryNotifications");
}

function shouldShowPlaybackStateNotification() {
    return $s.get("showPlaybackNotifications");
}

root.render(
    <ThemeProvider>
        <BrowserRouter basename={baseUrl} future={{ v7_relativeSplatPath: true }}>
            <div className="shell">
                <div className="navbar">
                    <a className="navbar-brand d-none d-lg-inline" href="/">UPnP Dashboard</a>
                    <nav>
                        <RouteLink to="/" end glyph="symbols.svg#home_work" className="nav-link">Home</RouteLink>
                        <RouteLink to="/upnp" glyph="symbols.svg#devices" className="nav-link"><span><span className="d-none d-lg-inline">UPnP&nbsp;</span>Devices</span></RouteLink>
                        <RouteLink to="/renderers" glyph="symbols.svg#connected_tv" className="nav-link"><span><span className="d-none d-lg-inline">Network&nbsp;</span>Players</span></RouteLink>
                        <RouteLink to="/umi" glyph="symbols.svg#speaker" className="nav-link"><span><span className="d-none d-lg-inline">Xiaomi&nbsp;</span>Speakers</span></RouteLink>
                        <RouteLink to="/settings" glyph="symbols.svg#settings" className="nav-link">Settings</RouteLink>
                    </nav>
                    <div className="d-none d-sm-flex flex-column align-items-center g-3 mt-auto">
                        <ThemeSwitch mode="responsive" />
                        <AppInfo className="small d-none d-lg-block mb-0" />
                    </div>
                </div>
                <main>
                    <div id="notifications-root" className="nt-host" />
                    <SignalRConnection url="/upnpevents">
                        <DeviceDiscoveryNotifier callback={shouldShowDiscoveryNotifications} />
                        <PlaybackStateNotifier callback={shouldShowPlaybackStateNotification} />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/index.html" element={<HomePage />} />
                            <Route path="/upnp/*" element={<UpnpDevicesPage />} />
                            <Route path="/renderers/*" element={<RendererDevicesPage />} />
                            <Route path="/umi/*" element={<UmiDevicesPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="*" element={
                                <div className="m-auto p-2 text-danger text-center">
                                    <svg className="icon icon-5x"><use href="symbols.svg#sentiment_very_dissatisfied" /></svg>
                                    <h3>404 - Not Found</h3>
                                    <h5>Page you are looking for is not found</h5>
                                </div>} />
                        </Routes>
                    </SignalRConnection>
                </main>
            </div>
        </BrowserRouter>
    </ThemeProvider>);

if (import.meta.env.DEV && import.meta.env.VITE_REG_DEV_SW !== "true") {
    SW.unregister();
}

SW.register();