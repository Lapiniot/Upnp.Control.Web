import { CSSProperties, HTMLProps } from "react";

export type ProgressCSSProperties = CSSProperties & {
    "--slider-progress"?: number;
    "--slider-animation"?: string;
    "--slider-animation-duration"?: string | number;
    "--slider-animation-name"?: string;
};

export type ProgressProps = {
    progress?: number;
    infinite?: boolean;
    trackStyle?: ProgressCSSProperties;
}

export default function Progress({ className, progress, infinite, trackStyle: style = {}, ...other }: HTMLProps<HTMLDivElement> & ProgressProps) {
    if (infinite) {
        style["--slider-animation"] = "2s ease-in-out infinite slider-run-infinite";
    }
    else {
        style["--slider-progress"] = progress;
    }

    return <div {...other} className={`w-100${className ? ` ${className}` : ""}`} role="button">
        <div className="progress-track" style={style}>
            <div className="progress-indicator" />
        </div>
    </div>;
}