import { HTMLAttributes } from "react";

export function BottomBar({ className, style = {}, ...other }: HTMLAttributes<HTMLDivElement>) {
    style.bottom = "-1px";
    const defaultClass = "sticky-bottom d-flex align-items-center justify-content-end bg-light border-top p-1";
    return <div {...other} style={style} className={`${defaultClass}${className ? ` ${className}` : ""}`} />;
}