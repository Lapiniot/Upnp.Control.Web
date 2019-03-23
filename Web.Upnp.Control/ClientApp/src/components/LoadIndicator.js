import React from "react";

export default class LoadIndicator extends React.Component {

    displayName = LoadIndicator.name;

    render() {
        return <div className="h-100 d-flex flex-fill justify-content-center align-items-center" {...this.props}>
            <div class="spinner-border mr-1" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            {this.props.children}
        </div>;
    }
}