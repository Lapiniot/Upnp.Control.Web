import React from "react";

export default class Spoiler extends React.Component {

    displayName = Spoiler.name;

    render() {
        return <div className="spoiler">
                   <button className="btn-light collapsed"
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