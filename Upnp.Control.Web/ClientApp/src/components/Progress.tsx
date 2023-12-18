import { CSSProperties, HTMLProps } from "react";

export type ProgressCSSProperties = CSSProperties & {
    "--slider-progress"?: number;
    "--slider-animation"?: string;
    "--slider-animation-duration"?: string | number;
    "--slider-animation-name"?: string;
};

export type ProgressProps = {
    value?: number;
    infinite?: boolean;
}

export default function Progress({ className, value, infinite, style = {}, ...other }: HTMLProps<HTMLDivElement> & ProgressProps) {
    const progressStyle: ProgressCSSProperties = {};

    if (infinite) {
        progressStyle["--slider-animation"] = "2s ease-in-out infinite slider-run-infinite";
    }
    else {
        progressStyle["--slider-progress"] = value;
    }

    return <div {...other} role="progressbar" style={{ ...style, ...progressStyle }}
        className={`progress${className ? ` ${className}` : ""}`}>
        <div className="progress-track">
            <div className="progress-indicator" />
        </div>
    </div>;
}