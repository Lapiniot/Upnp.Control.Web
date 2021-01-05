import { HTMLAttributes } from "react";
import "bootstrap/js/src/collapse";

export default ({ uniqueId, title, children, className, ...other }: { uniqueId: string; title: string; } & HTMLAttributes<HTMLDivElement>) =>
    <div className={`spoiler${className ? ` ${className}` : ""}`} {...other}>
        <button type="button" className="btn btn-light collapsed w-100"
            data-bs-toggle="collapse" data-bs-target={`#${uniqueId}`}
            aria-controls={uniqueId} aria-expanded="false">
            <i className="fa-fw" />{title}
        </button>
        <div className="collapse" id={uniqueId}>{children}</div>
    </div>;