import React, { ComponentProps, HTMLAttributes } from "react";
import Progress from "../../components/Progress";
import Slider from "../../components/Slider";
import Timer from "../../components/Timer";
import { formatTime } from "../../services/Extensions";

type PositionProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
    time: number;
    duration: number;
    running: boolean;
    onChange?: ComponentProps<typeof Slider>["onChange"]
};

export default class SeekBar extends React.Component<PositionProps> {

    spin = 0;

    getSliderStyle(running: boolean, current: number, total: number): any {

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
        const { time, duration, running, onChange, className, ...other } = this.props;

        const progress = duration > 0 ? time / duration : 0.0;
        const infinite = !Number.isFinite(time) || !Number.isFinite(duration) || duration === 0;

        return <div className={`d-flex flex-wrap user-select-none${className ? ` ${className}` : ""}`} {...other}>
            <Timer className="fs-tiny" current={time / 1000} running={running} />
            <time className="fs-tiny ms-auto">{formatTime(!infinite ? duration / 1000 : Infinity)}</time>
            {!infinite
                ? <Slider className="w-100 mt-1" value={progress} step={0.02} style={this.getSliderStyle(running, time, duration)} onChange={onChange} />
                : <Progress className="w-100 mt-1" infinite={running} value={progress} />}
        </div>;
    }
}