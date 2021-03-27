import React, { ButtonHTMLAttributes, HTMLAttributes } from "react";

export default class Toolbar extends React.Component<HTMLAttributes<HTMLDivElement>> {

    displayName = Toolbar.name;

    static Button = ({ className, glyph, children, visible, ...other }: ButtonHTMLAttributes<HTMLButtonElement> & { glyph?: string; visible?: boolean }) =>
        <button type="button" className={`btn${className ? ` ${className}` : ""}${visible === false ? " d-none" : ""}`} {...other}>
            {glyph && <svg><use href={`#${glyph}`} /></svg>}{children}
        </button>;

    static Group = ({ className, children, visible, ...other }: HTMLAttributes<HTMLDivElement> & { visible?: boolean }) =>
        <div className={`btn-group align-items-center${className ? ` ${className}` : ""} ${visible === false ? " d-none" : ""}`} role="group" {...other}>
            {children}
        </div>;

    render() {
        const { className, children, ...other } = this.props;
        return <div className={`btn-toolbar align-items-center${className ? ` ${className}` : ""}`} role="toolbar" {...other}>
            {children}
        </div>;
    }
}