import React from "react";
import { formatTime } from "./Extensions";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.nativeRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.running)
            this.start();
    }

    componentDidUpdate() {
        if (this.props.running) {
            this.start();
        } else {
            this.stop();
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
        this.nativeRef.current.textContent = formatTime(this.current);
    }

    render() {
        const { current, running, total, ...other } = this.props;
        return <small {...other} ref={this.nativeRef}>{formatTime(current)}</small>;
    }
}