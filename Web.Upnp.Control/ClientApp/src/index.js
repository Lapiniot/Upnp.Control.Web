import "./css/index.css";
import "bootstrap/dist/js/bootstrap";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";

import React from "react";
import { Route } from "react-router";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import { UpnpBrowser, UmiBrowser } from "./components/upnp/DeviceBrowser";
import Settings from "./components/Settings";

const baseUrl = document.getElementsByTagName("base")[0].getAttribute("href");
const container = document.getElementById("root-view");

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        <Layout>
            <Route exact path="/" component={Home} />
            <Route path="/settings" component={Settings} />
            <Route path="/upnp" component={UpnpBrowser} />
            <Route path="/umi" component={UmiBrowser} />
        </Layout>
    </BrowserRouter>,
    container);