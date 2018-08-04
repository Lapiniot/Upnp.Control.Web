import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { withMatchProps } from "../../../components/Extensions";
import { withBrowserCore } from "../../common/BrowserCore";
import { BrowserView } from "../../common/Browser";

/***** Handles all /umi/browse routes *****/
export default class UmiBrowser extends React.Component {

    displayName = UmiBrowser.name;

    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={path} exact render={() => <Redirect to="/umi" />} />
                   <Route path={`${path}/:device/:id(.*)?`} render={withMatchProps(Browser, { baseUrl: url })} />
               </Switch>;
    }
}

const Browser = withBrowserCore(BrowserView);