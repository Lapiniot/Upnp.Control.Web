import React from "react";
import { mergeClassNames as merge } from "./Extensions";

export default class Toolbar extends React.Component {

    displayName = Toolbar.name;

    static Button = ({ className, areaLabel, title, glyph, children, ...other }) =>
        <button type="button" className={merge`btn ${className}`} title={title} area-label={areaLabel} {...other}>
            {glyph && <i className={`fas fa-${glyph}`} />}{children}
        </button>;

    static Group = ({ className, areaLabel, children, ...other }) =>
        <div className={merge`btn-group ${className}`} role="group" aria-label={areaLabel} {...other}>
            {children}
        </div>;

    render() {
        const { className, areaLabel, children, ...other } = this.props;
        return <div className={merge`btn-toolbar ${className}`} role="toolbar" aria-label={areaLabel} {...other}>
            {children}
        </div>;
    }
}