import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { renderWithDeviceProps, withBrowserCore } from "../../common/BrowserCore";
import { BrowserView } from "../../common/Browser";

/***** Handles all /umi/browse routes *****/
export default class UmiBrowser extends React.Component {

    displayName = UmiBrowser.name;

    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={path} exact render={() => <Redirect to="/umi" />} />
                   <Route path={`${path}/:device/:id(.*)?`} render={renderWithDeviceProps(Browser, { baseUrl: url })} />
               </Switch>;
    }
}

const Browser = withBrowserCore(BrowserView);