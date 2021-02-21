import React, { HTMLAttributes, RefObject } from "react";
import { formatTime } from "./Extensions";

type TimerProps = { running: boolean; current: number; interval?: number }

export default class extends React.Component<TimerProps & HTMLAttributes<HTMLTimeElement>> {
    nativeRef: RefObject<HTMLElement> = React.createRef();
    start: number = 0;
    controller: AbortController | null = null;
    interval: number = 1000;

    componentDidMount() {
        if (this.props.running && Number.isFinite(this.props.current))
            this.startTimer();
    }

    componentDidUpdate() {
        this.stopTimer();
        if (this.props.running && Number.isFinite(this.props.current)) {
            this.startTimer();
        }
    }

    componentWillUnmount() {
        this.stopTimer();
    }

    startTimer = () => {
        this.controller = new AbortController();
        this.start = document.timeline.currentTime ?? 0;
        this.interval = this.props.interval ?? 1000;
        this.scheduleNext(this.start);
    }

    stopTimer = () => {
        this.controller?.abort();
    }

    scheduleNext = (time: number) => {
        const ellapsed = time - this.start;
        const target = this.start + Math.round(ellapsed / this.interval) * this.interval + this.interval;
        setTimeout(() => requestAnimationFrame(this.update), target - performance.now());
    }

    update = (time: number) => {
        if (this.controller?.signal.aborted) return;

        if (this.nativeRef?.current) {
            this.nativeRef.current.textContent = formatTime((time - this.start) / 1000 + this.props.current);
        }

        this.scheduleNext(time);
    }

    render() {
        const { current, running, ...other } = this.props;
        return <time {...other} ref={this.nativeRef}>{formatTime(current)}</time>;
    }
}