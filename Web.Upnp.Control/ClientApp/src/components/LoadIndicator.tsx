import React from "react";
import { HTMLAttributes } from "react";

export class MicroLoader extends React.Component {

    shouldComponentUpdate() { return false; }

    render() {
        return <svg className="icon animate-spin" viewBox="0 0 512 512">
            <path d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path>
        </svg>
    }
}

export function Indicator({ children, className, ...others }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`d-inline-flex justify-content-center align-items-center${className ? ` ${className}` : ""}`} {...others}>
        {children}
    </div>
}

export function LoadIndicator({ children = "Loading...", ...others }: HTMLAttributes<HTMLDivElement>) {
    return <Indicator {...others}>
        <span className="visually-hidden" role="status">Loading...</span>
        <svg className="icon icon-3x animate-spin" viewBox="0 0 496 512">
            <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zM88 256H56c0-105.9 86.1-192 192-192v32c-88.2 0-160 71.8-160 160zm160 96c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z"></path>
        </svg>
        {children}
    </Indicator>
}

export function LoadIndicatorOverlay({ children, className, ...other }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`backdrop d-flex justify-content-center${className ? ` ${className}` : ""}`} {...other}>
        <LoadIndicator className="flex-column">{children}</LoadIndicator>
    </div>
}