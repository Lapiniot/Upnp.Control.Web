import React, { HTMLAttributes, PropsWithChildren } from "react";

export default class Toolbar extends React.Component<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> {

    displayName = Toolbar.name;

    static Button = ({ className, glyph, children, visible, ...other }:
        PropsWithChildren<{ glyph?: string; visible?: boolean } & HTMLAttributes<HTMLButtonElement>>) =>
        <button type="button" className={`btn${className ? ` ${className}` : ""}${visible === false ? " d-none" : ""}`} {...other}>
            {glyph && <i className={`fas fa-${glyph}`} />}{children}
        </button>;

    static Group = ({ className, children, visible, ...other }:
        PropsWithChildren<{ visible?: boolean } & HTMLAttributes<HTMLDivElement>>) =>
        <div className={`btn-group${className ? ` ${className}` : ""} ${visible === false ? " d-none" : ""}`} role="group" {...other}>
            {children}
        </div>;

    render() {
        const { className, children, ...other } = this.props;
        return <div className={`btn-toolbar${className ? ` ${className}` : ""}`} role="toolbar" {...other}>
            {children}
        </div>;
    }
}