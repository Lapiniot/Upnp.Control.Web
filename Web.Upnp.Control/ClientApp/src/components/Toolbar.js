import React from "react";

export default class Toolbar extends React.Component {

    displayName = Toolbar.name;

    static Button = ({ className, areaLabel, title, glyph, children, visible, ...other }) =>
        <button type="button" className={`btn${className ? ` ${className}` : ""}${visible === false ? " d-none" : ""}`}
            title={title} area-label={areaLabel} {...other}>
            {glyph && <i className={`fas fa-${glyph}`} />}{children}
        </button>;

    static Group = ({ className, areaLabel, children, visible, ...other }) =>
        <div className={`btn-group${className ? ` ${className}` : ""} ${visible === false ? " d-none" : ""}`}
            role="group" aria-label={areaLabel} {...other}>
            {children}
        </div>;

    render() {
        const { className, areaLabel, children, ...other } = this.props;
        return <div className={`btn-toolbar${className ? ` ${className}` : ""}`}
            role="toolbar" aria-label={areaLabel} {...other}>
            {children}
        </div>;
    }
}