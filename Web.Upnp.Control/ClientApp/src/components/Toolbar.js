import React from "react";
import { mergeClassNames as merge } from "./Extensions";

export default class Toolbar extends React.Component {

    static Button = class extends React.Component {
        render() {
            const { className, areaLabel, title, glyph, ...other } = this.props;
            return <button type="button" className={merge`btn ${className}`} title={title} area-label={areaLabel} {...other}>
                {glyph && <i className={`fas fa-${glyph}`} />}
            </button>
        }
    }

    static Group = class extends React.Component {
        render() {
            const { className, areaLabel, ...other } = this.props;
            return <div className={merge`btn-group ${className}`} role="group" aria-label={areaLabel} {...other}>
                {this.props.children}
            </div>
        }
    }

    render() {
        const { className, areaLabel, ...other } = this.props;
        return <div className={merge`btn-toolbar ${className}`}
            role="toolbar" aria-label={areaLabel} {...other}>
            {this.props.children}
        </div>;
    }
}