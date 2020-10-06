import React from "react";
import { parseMilliseconds, formatTime } from "../../components/Extensions";
import Timer from "../../components/Timer";
import Slider from "../../components/Slider";

export default class Progress extends React.Component {

    constructor(props) {
        super(props);
        this.spin = 0;
    }

    render() {
        const { time, duration, running, onChangeRequested } = this.props;
        const total = parseMilliseconds(duration);
        const current = parseMilliseconds(time);

        if (!total) return null;

        const progress = total > 0 ? Math.round(current * 100 / total) : 0;

        // we constantly switch between animations with same settings, but different names 'inflate-width-0' and
        // 'inflate-width-1' e.g. - this is a trick in order to apply new animation resetting running one
        const style = running
            ? { animation: `inflate-width-${this.spin} ${total - current}ms linear forwards` }
            : { animation: "none" };

        this.spin ^= 0x01;

        return <div className="d-flex flex-wrap justify-content-between user-select-none">
            <Timer className="text-tiny" current={current / 1000} total={total / 1000} running={running} />
            <small className="text-tiny">{formatTime(total / 1000)}</small>
            <Slider progress={progress} className="flex-basis-100" style={style} onChangeRequested={onChangeRequested} />
        </div>;
    }
}