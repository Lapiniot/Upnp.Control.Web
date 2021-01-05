import React, { HTMLAttributes } from "react";

export function Indicator({ children, className, ...others }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`d-inline-flex justify-content-center align-items-center${className ? ` ${className}` : ""}`} {...others}>
        {children}
    </div>
}

export function LoadIndicator({ children = "Loading...", ...others }: HTMLAttributes<HTMLDivElement>) {
    return <Indicator {...others}>
        <span className="visually-hidden" role="status">Loading...</span>
        <i className="fas fa-compact-disc fa-spin fa-3x" />
        {children}
    </Indicator>
}

export function LoadIndicatorOverlay({ children, className, ...other }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`backdrop text-center${className ? ` ${className}` : ""}`} {...other}>
        <LoadIndicator className="vp-center flex-column">{children}</LoadIndicator>
    </div>
}