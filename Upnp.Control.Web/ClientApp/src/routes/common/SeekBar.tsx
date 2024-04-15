import { ComponentProps, HTMLAttributes } from "react";
import Progress from "../../components/Progress";
import Slider from "../../components/Slider";
import Timer from "../../components/Timer";
import { formatTime } from "../../services/Extensions";

type PositionProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
    time: number;
    duration: number;
    running: boolean;
    onChange?: ComponentProps<typeof Slider>["onChange"]
}

function getSliderStyle(running: boolean, current: number, total: number): ComponentProps<typeof Slider>["style"] {
    return running
        ? {
            "--bs-slider-animation-duration": `${total - current}ms`,
            "--bs-slider-animation-running": "initial"
        } : {
            "--bs-slider-animation-duration": "0",
            "--bs-slider-animation-running": " "
        };
}

export default function SeekBar(props: PositionProps) {
    const { time, duration, running, onChange, className, ...other } = props;
    const progress = duration > 0 ? time / duration : 0.0;
    const infinite = !Number.isFinite(time) || !Number.isFinite(duration) || duration === 0;

    return <div className={`d-flex flex-wrap user-select-none${className ? ` ${className}` : ""}`} {...other}>
        <Timer className="fs-tiny" current={time / 1000} running={running} />
        <time className="fs-tiny ms-auto">{formatTime(!infinite ? duration / 1000 : Infinity)}</time>
        {!infinite
            ? <Slider className="w-100" value={progress} step={0.02} style={getSliderStyle(running, time, duration)} onChange={onChange} />
            : <Progress className="w-100" infinite={running} value={progress} />}
    </div>
}