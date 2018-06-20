import React from "react";
import Icon from "./Icon";

export default class Spoiler extends React.Component {

    displayName = Spoiler.name;

    render() {
        return <div>
                    <button className="btn btn-block btn-light text-left collapsed"
                            aria-expanded="false" aria-controls={this.props.uniqueId} role="button"
                            data-toggle="collapse" data-target={`#${this.props.uniqueId}`}>
                        <i />{this.props.title}
                    </button>
                    <div className="collapse" id={this.props.uniqueId}>
                        {this.props.children}
                    </div>
                </div>;
    }
}   