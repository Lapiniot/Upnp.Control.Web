import React, { HTMLAttributes } from "react";
import { parseMilliseconds, formatTime } from "../../components/Extensions";
import Timer from "../../components/Timer";
import Slider, { SliderChangeHandler, SliderCSSProperties } from "../../components/Slider";
import { Progress } from "../../components/Progress";

type PositionProps = HTMLAttributes<HTMLDivElement> & {
    time: string;
    duration: string;
    running: boolean;
    onChangeRequested: SliderChangeHandler
};

export default class SeekBar extends React.Component<PositionProps> {

    spin = 0;

    getSliderStyle(running: boolean, current: number, total: number): SliderCSSProperties {

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
        const total = parseMilliseconds(duration);
        const current = parseMilliseconds(time);

        const progress = total > 0 ? current / total : 0;
        const infinite = !Number.isFinite(current) || !Number.isFinite(total) || total < current;

        return <div className={`d-flex flex-wrap justify-content-between user-select-none${className ? ` ${className}` : ""}`} {...other}>
            <Timer className="text-tiny" current={current / 1000} running={running} />
            <time className="text-tiny">{formatTime(!infinite ? total / 1000 : Infinity)}</time>
            {!infinite
                ? <Slider progress={progress} className="flex-basis-100" style={this.getSliderStyle(running, current, total)} onChangeRequested={onChangeRequested} />
                : <Progress infinite={running} className="flex-basis-100" />}
        </div>;
    }
}