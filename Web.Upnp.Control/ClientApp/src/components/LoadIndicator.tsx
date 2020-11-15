import React, { HTMLAttributes, PropsWithChildren } from "react";

export default function LoadIndicator({ children = "Loading...", className, ...others }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
    return <div className={`d-inline-flex justify-content-center align-items-center${className ? ` ${className}` : ""}`} {...others}>
        <span className="visually-hidden" role="status">Loading...</span>
        <i className="fas fa-compact-disc fa-spin fa-3x" />
        {children}
    </div>
}

export function LoadIndicatorOverlay({ children }: PropsWithChildren<{}>) {
    return <div className="backdrop text-center">
        <LoadIndicator className="vp-center flex-column">{children}</LoadIndicator>
    </div>
}