import { CSSProperties, HTMLProps } from "react";

type CustomProps = {
    "value"?: number;
    "infinite"?: " " | "initial";
    "animation"?: string;
    "animation-duration"?: string;
    "animation-name"?: string;
}

type ProgressCSSProperties = CSSProperties &
    { [K in keyof CustomProps as `--bs-progress-${K}`]: CustomProps[K] }

interface ProgressProps extends Omit<HTMLProps<HTMLDivElement>, "value"> {
    value?: number;
    infinite?: boolean;
    style?: ProgressCSSProperties;
}

export default function Progress({ className, value, infinite, style = {}, ...other }: ProgressProps) {
    const progressStyle = { ...style };
    if (infinite) {
        progressStyle["--bs-progress-infinite"] = "initial";
    } else {
        progressStyle["--bs-progress-value"] = value ? Math.round(value * 100) / 100 : 0;
    }

    return <div {...other} role="progressbar" style={progressStyle}
        className={`progress${className ? ` ${className}` : ""}`}
        title={infinite ? undefined : `${((value ?? 0) * 100).toFixed()}%`} >
    </div>
}