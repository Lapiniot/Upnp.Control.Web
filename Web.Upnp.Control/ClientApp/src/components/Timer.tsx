import React, { HTMLAttributes, RefObject } from "react";
import { formatTime } from "./Extensions";

type TimerProps = { running: boolean; current: number; }

export default class extends React.Component<TimerProps & HTMLAttributes<HTMLTimeElement>> {
    nativeRef: RefObject<HTMLElement> = React.createRef();
    current: number = 0;
    interval: NodeJS.Timeout | null = null;

    componentDidMount() {
        if (this.props.running)
            this.start();
    }

    componentDidUpdate() {
        this.stop();
        if (this.props.running) {
            this.start();
        }
    }

    componentWillUnmount() {
        this.stop();
    }

    start = () => {
        if (this.interval) return;
        this.current = this.props.current;
        this.interval = setInterval(this.update, 1000);
    }

    stop = () => {
        if (!this.interval) return;
        clearInterval(this.interval);
        this.interval = null;
    }

    update = () => {
        this.current += 1;
        if (this.nativeRef?.current) {
            this.nativeRef.current.textContent = formatTime(this.current);
        }
    }

    render() {
        const { current, running, ...other } = this.props;
        return <time {...other} ref={this.nativeRef}>{formatTime(current)}</time>;
    }
}