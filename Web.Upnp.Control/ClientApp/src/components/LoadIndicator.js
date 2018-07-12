import React from "react";
import Spinner from "./Spinner";

export default class LoadIndicator extends React.Component {

    displayName = LoadIndicator.name;

    render() {
        return <div className="d-flex-fill-center">
                   <Spinner>{this.props.children}</Spinner>
               </div>;
    }
}