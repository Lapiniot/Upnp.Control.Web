import { HTMLAttributes } from "react";

export function BottomBar({ className, ...other }: HTMLAttributes<HTMLDivElement>) {
    const defaultClass = "sticky-bottom d-flex align-items-center justify-content-end bg-white border-top p-1 px-2";
    return <div {...other} className={`${defaultClass}${className ? ` ${className}` : ""}`} />;
}