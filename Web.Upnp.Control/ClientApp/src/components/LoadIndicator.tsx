import React, { HTMLAttributes, PropsWithChildren } from "react";

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

export function DropTargetIndicator({ children = "Drop files here", ...others }: HTMLAttributes<HTMLDivElement>) {
    return <Indicator {...others}>
        <i className="fas fa-upload fa-3x" />
        {children}
    </Indicator>
}

export function LoadIndicatorOverlay({ children }: PropsWithChildren<{}>) {
    return <div className="backdrop text-center">
        <LoadIndicator className="vp-center flex-column">{children}</LoadIndicator>
    </div>
}