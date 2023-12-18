import { HTMLAttributes } from "react";

export function BottomBar({ className, ...other }: HTMLAttributes<HTMLDivElement>) {
    const defaultClass = "sticky-bottom hstack justify-content-end bg-white border-top p-1 px-2";
    return <div role="toolbar" {...other} className={`${defaultClass}${className ? ` ${className}` : ""}`} />;
}