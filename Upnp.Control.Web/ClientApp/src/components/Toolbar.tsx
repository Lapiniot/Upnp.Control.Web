import React, { ButtonHTMLAttributes, HTMLAttributes } from "react";

export default class Toolbar extends React.Component<HTMLAttributes<HTMLDivElement>> {

    displayName = Toolbar.name;

    static Button = ({ className, icon, children, visible, ...other }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: string; visible?: boolean }) =>
        <button type="button" className={`btn${className ? ` ${className}` : ""}${visible === false ? " d-none" : ""}`} {...other}>
            {icon && <svg><use href={icon} /></svg>}{children}
        </button>;

    static Group = ({ className, children, visible, ...other }: HTMLAttributes<HTMLDivElement> & { visible?: boolean }) =>
        <div className={`d-inline-flex align-items-center${className ? ` ${className}` : ""} ${visible === false ? " d-none" : ""}`} role="group" {...other}>
            {children}
        </div>;

    render() {
        const { className, children, ...other } = this.props;
        return <div className={`toolbar${className ? ` ${className}` : ""}`} role="toolbar" {...other}>
            {children}
        </div>;
    }
}