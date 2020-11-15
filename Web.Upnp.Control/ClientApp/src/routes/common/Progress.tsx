import React, { HTMLAttributes } from "react";
import { parseMilliseconds, formatTime } from "../../components/Extensions";
import Timer from "../../components/Timer";
import Slider, { SliderChangeHandler, SliderCSSProperties } from "../../components/Slider";

type ProgressProps = HTMLAttributes<HTMLDivElement> & {
    time: string;
    duration: string;
    running: boolean;
    onChangeRequested: SliderChangeHandler
};

export default class Progress extends React.Component<ProgressProps> {

    spin = 0;

    render() {
        const { time, duration, running, onChangeRequested, className, ...other } = this.props;
        const total = parseMilliseconds(duration);
        const current = parseMilliseconds(time);

        if (!total) return null;

        const progress = total > 0 ? current / total : 0;

        // we constantly switch between animations with same settings, but different names 'slider-run0' and
        // 'slider-run1' e.g. - this is a trick in order to apply new animation resetting running one
        const style: SliderCSSProperties = running
            ? {
                "--slider-animation-duration": `${total - current}ms`,
                "--slider-animation-name": `slider-run${this.spin}`
            } : {
                "--slider-animation-duration": 0,
                "--slider-animation-name": "none"
            };

        this.spin ^= 0x01;

        return <div className={`d-flex flex-wrap justify-content-between user-select-none${className ? ` ${className}` : ""}`} {...other}>
            <Timer className="text-tiny" current={current / 1000} running={running} />
            <time className="text-tiny">{formatTime(total / 1000)}</time>
            <Slider progress={progress} className="flex-basis-100" style={style} onChangeRequested={onChangeRequested} />
        </div>;
    }
}