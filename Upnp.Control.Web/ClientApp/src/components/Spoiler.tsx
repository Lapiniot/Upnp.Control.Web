import { HTMLAttributes } from "react";
import "bootstrap/js/src/collapse";
import { useId } from "react";

type SpoilerProps = HTMLAttributes<HTMLDivElement> & {
    title: string;
    disabled?: boolean;
}

// TODO: investigate for more semantically suitable <details> element

export default ({ title, children, className, disabled, ...other }: SpoilerProps) => {
    const id = useId().replaceAll(":", "_");
    return <div className={`spoiler${className ? ` ${className}` : ""}`} {...other}>
        <button type="button" disabled={disabled} className="btn collapsed w-100"
            data-bs-toggle="collapse" data-bs-target={`#${id}`}
            aria-controls={id} aria-expanded="false">
            {title}
        </button>
        <div className="collapse" id={id}>{children}</div>
    </div>
}