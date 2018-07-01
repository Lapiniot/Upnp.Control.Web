import React from "react"

export default class Icon extends React.Component {

    displayName = Icon.name;

    render() {
        const { glyph, className, ...other } = this.props;
        return <i className={`fas fa-${glyph}${className ? ` ${className}` : ""}`} {...other} />;
    }
}