import { HTMLAttributes } from "react";

export type GridViewMode = "grid" | "carousel" | "auto";

export function GridView({ viewMode, className, children, ...other }: HTMLAttributes<HTMLDivElement> & { viewMode?: GridViewMode; }) {
    const viewClass = viewMode === "grid"
        ? "grid-responsive-auto"
        : viewMode === "carousel"
            ? "grid-carousel"
            : "grid-carousel grid-responsive-auto-sm";
    return <div role="grid" {...other} className={`d-grid g-3 ${viewClass}${className ? " " + className : ""}`}>
        {children}
    </div>;
}