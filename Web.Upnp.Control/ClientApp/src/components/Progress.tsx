import React, { CSSProperties, HTMLProps } from "react";

export type ProgressCSSProperties = CSSProperties & {
    "--slider-progress"?: number;
    "--slider-animation"?: string;
    "--slider-animation-duration"?: string | number;
    "--slider-animation-name"?: string;
};

export type ProgressProps = HTMLProps<HTMLDivElement> & {
    progress?: number;
    infinite?: boolean;
    style?: ProgressCSSProperties;
}

export class Progress extends React.Component<ProgressProps> {

    render() {
        const { progress, infinite, style = {} as ProgressCSSProperties, ...other } = this.props;

        if (infinite) {
            style["--slider-animation"] = "2s ease-in-out infinite slider-run-infinite";
        }
        else {
            style["--slider-progress"] = progress;
        }

        return <div role="button" {...other}>
            <div className="progress-track" style={style}>
                <div className="progress-indicator" />
            </div>
        </div>;
    }
}