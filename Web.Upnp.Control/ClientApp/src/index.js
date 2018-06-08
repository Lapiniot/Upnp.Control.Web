import './css/bootstrap.css';
import './css/index.css';
import React from 'react';
import { Route } from 'react-router';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { UmiDevices } from './components/UmiDevices';
import { UpnpDevices } from './components/UpnpDevices';
import { Settings } from './components/Settings';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const container = document.getElementById('container');

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        <Layout>
            <Route exact path='/' component={Home} />
            <Route path='/umi' component={UmiDevices} />
            <Route path='/upnp' component={UpnpDevices} />
            <Route path='/settings' component={Settings} />
        </Layout>
    </BrowserRouter>,
    container);