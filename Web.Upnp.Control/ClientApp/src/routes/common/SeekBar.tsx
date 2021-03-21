import React, { HTMLAttributes } from "react";
import { formatTime } from "../../components/Extensions";
import Timer from "../../components/Timer";
import Slider, { SliderChangeHandler } from "../../components/Slider";
import Progress, { ProgressCSSProperties } from "../../components/Progress";

type PositionProps = HTMLAttributes<HTMLDivElement> & {
    time: number;
    duration: number;
    running: boolean;
    onChangeRequested: SliderChangeHandler
};

export default class SeekBar extends React.Component<PositionProps> {

    spin = 0;

    getSliderStyle(running: boolean, current: number, total: number): ProgressCSSProperties {

        // we constantly switch between animations with same settings, but different names 'slider-run0' and
        // 'slider-run1' e.g. - this is a trick in order to apply new animation resetting running one
        this.spin ^= 0x01;

        return running
            ? {
                "--slider-animation-duration": `${total - current}ms`,
                "--slider-animation-name": `slider-run${this.spin}`
            } : {
                "--slider-animation-duration": 0,
                "--slider-animation-name": "none"
            };
    }

    render() {
        const { time, duration, running, onChangeRequested, className, ...other } = this.props;

        const progress = duration > 0 ? time / duration : 1.0;
        const infinite = !Number.isFinite(time) || !Number.isFinite(duration) || duration === 0;

        return <div className={`d-flex flex-wrap user-select-none${className ? ` ${className}` : ""}`} {...other}>
            <Timer className="text-tiny" current={time / 1000} running={running} />
            <time className="text-tiny ms-auto">{formatTime(!infinite ? duration / 1000 : Infinity)}</time>
            {!infinite
                ? <Slider progress={progress} trackStyle={this.getSliderStyle(running, time, duration)} onChangeRequested={onChangeRequested} />
                : <Progress infinite={running} progress={progress} />}
        </div>;
    }
}