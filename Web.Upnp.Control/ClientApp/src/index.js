﻿import "./css/index.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import React from "react";
import { Route } from "react-router";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import UmiDevices from "./components/umi/UmiDevices";
import UpnpDevices from "./components/upnp/UpnpDevices";
import Settings from "./components/Settings";

const baseUrl = document.getElementsByTagName("base")[0].getAttribute("href");
const container = document.getElementById("root-view");

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        <Layout>
            <Route exact path="/" component={Home}/>
            <Route path="/umi" component={UmiDevices}/>
            <Route path="/upnp" component={UpnpDevices}/>
            <Route path="/settings" component={Settings}/>
        </Layout>
    </BrowserRouter>,
    container);