import { DetailsHTMLAttributes } from "react";

type SpoilerProps = DetailsHTMLAttributes<HTMLDetailsElement> & {
    caption: string;
    disabled?: boolean;
}

export default ({ caption, children, className, disabled, open, ...other }: SpoilerProps) => {
    return <details open className={`spoiler${className ? ` ${className}` : ""}`} {...other} inert={disabled ? "" : undefined}>
        <summary>
            <input type="checkbox" />
            <span>{caption}</span>
        </summary>
        <div>
            {/* Do not remove this wrapper div! It wraps children content and has to have overflow: hidden set.
            It makes the trick together with parent div with display: grid and dynamic content 
            row height animatable from 0fr to 1fr. */}
            <div>
                {children}
            </div>
        </div>
    </details>
}