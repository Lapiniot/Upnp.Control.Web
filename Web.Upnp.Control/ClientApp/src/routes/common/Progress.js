import React from "react";
import { parseMilliseconds, formatTime } from "../../components/Extensions";
import Timer from "../../components/Timer";

export class Progress extends React.Component {

    clickHandler = e => {
        const element = e.currentTarget;
        const rect = element.getBoundingClientRect();
        const position = (e.clientX - rect.left) / element.clientWidth;
        if (this.props.onChangeRequested) {
            this.props.onChangeRequested(position);
        }
    };

    render() {
        const { time, duration, running } = this.props;
        const total = parseMilliseconds(duration);
        const current = parseMilliseconds(time);

        if (!total) return null;

        const progress = total > 0 ? Math.round(current * 100 / total) : 0;

        const style = running
            ? { width: `${progress}%`, animation: `inflate-width ${total - current}ms linear forwards` }
            : { width: `${progress}%` };

        return <div className="d-flex flex-wrap justify-content-between user-select-none" onClick={this.clickHandler}>
            <Timer className="text-tiny" current={current / 1000} total={total / 1000} running={running} />
            <small className="text-tiny">{formatTime(total / 1000)}</small>
            <div className="slider my-2 flex-basis-100">
                <div className="slider-line" style={style} />
                <div className="slider-ticker" />
            </div>
        </div>;
    }
}