import { DetailsHTMLAttributes } from "react";

type SpoilerProps = DetailsHTMLAttributes<HTMLDetailsElement> & {
    title: string;
    disabled?: boolean;
}

export default ({ title, children, className, disabled, ...other }: SpoilerProps) => {
    return <details className={`spoiler${className ? ` ${className}` : ""}`} {...other}>
        <summary className={disabled ? "disabled" : ""} tabIndex={disabled ? -1 : undefined}>{title}</summary>
        {children}
    </details>
}