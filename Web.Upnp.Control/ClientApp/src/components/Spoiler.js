import React from "react";
import Icon from "./Icon";

export default class Spoiler extends React.Component {

    displayName = Spoiler.name;

    render() {
        return <div id={this.props.uniqueId}>
                   <button className="btn btn-block btn-light text-left"
                           aria-expanded="false" role="button" data-toggle="collapse"
                           data-target={`div#${this.props.uniqueId}>div.collapse`}>
                       <Icon glyph="angle-down" />{this.props.title}
                   </button>
                   <div className="collapse">
                       {this.props.children}
                   </div>
               </div>;
    }
}