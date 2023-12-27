import { DetailsHTMLAttributes } from "react";

type SpoilerProps = DetailsHTMLAttributes<HTMLDetailsElement> & {
    title: string;
    disabled?: boolean;
}

export default ({ title, children, className, disabled, ...other }: SpoilerProps) => {
    return <details className={`spoiler${className ? ` ${className}` : ""}`} {...other} inert={disabled ? "" : undefined}>
        <summary>{title}</summary>
        <div>{children}</div>
    </details>
}