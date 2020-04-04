import React from "react";
import { mergeClassNames as merge } from "./Extensions";

export default class Toolbar extends React.Component {

    displayName = Toolbar.name;

    static Button = ({ className, areaLabel, title, glyph, children, visible, ...other }) =>
        <button type="button" className={merge`btn ${className} ${visible === false ? 'd-none' : ''}`} title={title} area-label={areaLabel} {...other}>
            {glyph && <i className={`fas fa-${glyph}`} />}{children}
        </button>;

    static Group = ({ className, areaLabel, children, visible, ...other }) =>
        <div className={merge`btn-group ${className} ${visible === false ? 'd-none' : ''}`} role="group" aria-label={areaLabel} {...other}>
            {children}
        </div>;

    render() {
        const { className, areaLabel, children, ...other } = this.props;
        return <div className={merge`btn-toolbar ${className}`} role="toolbar" aria-label={areaLabel} {...other}>
            {children}
        </div>;
    }
}