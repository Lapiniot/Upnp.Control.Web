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
        const { progress, style = {} as SliderCSSProperties, onChangeRequested, ...other } = this.props;
        style["--slider-progress"] = progress;

        return <div onClick={this.clickHandler} role="button" {...other}>
            <div className="slider" style={style}>
                <div className="slider-line" />
                <div className="slider-ticker">
                    <div />
                </div>
            </div>
        </div>;
    }
}