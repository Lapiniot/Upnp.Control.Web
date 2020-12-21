import React, { CSSProperties, HTMLProps, MouseEventHandler } from "react";

export type SliderChangeHandler = (position: number) => void

export type SliderCSSProperties = CSSProperties & {
    "--slider-progress"?: number;
    "--slider-animation-duration"?: string | number;
    "--slider-animation-name"?: string;
};

type SliderProps = HTMLProps<HTMLDivElement> & {
    progress: number;
    onChangeRequested: SliderChangeHandler;
    style?: SliderCSSProperties;
}

export default class extends React.Component<SliderProps> {

    clickHandler: MouseEventHandler<HTMLDivElement> = (e) => {
        const element = e.currentTarget;
        if (element) {
            const rect = element.getBoundingClientRect();
            const position = (e.clientX - rect.left) / element.clientWidth;
            if (this.props.onChangeRequested) {
                this.props.onChangeRequested(position);
            }
        }
    };

    render() {
        const { progress, style = {} as SliderCSSProperties, onChangeRequested, readOnly, ...other } = this.props;
        style["--slider-progress"] = progress;

        return <div onClick={!readOnly ? this.clickHandler : undefined} role="button" {...other}>
            <div className="slider-track" style={style}>
                <div className="slider-indicator" />
                <div className="slider-thumb"><div /></div>
            </div>
        </div>;
    }
}