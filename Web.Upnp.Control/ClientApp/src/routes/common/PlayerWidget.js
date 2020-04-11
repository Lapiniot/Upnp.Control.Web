import React from "react";
import Toolbar from "../../components/Toolbar";
import { withDataFetch } from "../../components/DataFetch";
import { SignalRListener } from "../../components/SignalR";
import $api from "../../components/WebApi";

class PlayerCore extends React.Component {
    constructor(props) {
        super(props);
        this.handlers = new Map([["AVTransportEvent", this.onAVTransportEvent]]);
        this.state = { actions: [], current: null, next: null, playbackState: null };
        this.ctrl = $api.control(this.props.udn);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.udn !== this.props.udn) {
            this.ctrl = $api.control(this.props.udn);
        }
    }

    static getDerivedStateFromProps({ dataContext, dataContext: { source } = {} } = {}, prevState) {
        return (dataContext !== prevState.dataContext) ? {
            dataContext: dataContext, actions: source.actions,
            current: source.current, next: source.next, playbackState: source.state
        } : null;
    }

    onAVTransportEvent = (device, { state: { actions, current, next, state }, vendor }) => {
        if (device === this.props.udn) {
            this.setState({ actions, current, next, playbackState: state, vendor })
        }
    }

    play = () => this.ctrl.play().fetch();

    pause = () => this.ctrl.pause().fetch();

    stop = () => this.ctrl.stop().fetch();

    prev = () => this.ctrl.prev().fetch();

    next = () => this.ctrl.next().fetch();

    render() {
        const { actions = [], current, next, playbackState } = this.state;
        const transitioning = playbackState === "TRANSITIONING";
        return <>
            <SignalRListener handlers={this.handlers} >{null}</SignalRListener>
            <div className="d-flex flex-column">
                <div className="progress my-1" style={{ height: "3px" }}>
                    <div className="progress-bar" role="progressbar" style={{ width: "25%" }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" />
                </div>
                <div className="d-flex align-items-center">
                    <Toolbar className="bg-normal">
                        <Toolbar.Group>
                            <Toolbar.Button title="Prev" onClick={this.prev} glyph="step-backward fa-sm" className="px-1" disabled={!actions.includes("Previous")} />
                            {actions.includes("Play") && <Toolbar.Button title="Play" onClick={this.play} glyph="play-circle" className="fa-2x" />}
                            {(actions.includes("Pause") || transitioning) && <Toolbar.Button title="Pause" onClick={this.pause} glyph="pause-circle" className="fa-2x" disabled={transitioning} />}
                            <Toolbar.Button title={next ? `Next: ${next.title}` : "Next"} onClick={this.next} glyph="step-forward fa-sm" className="px-1" disabled={!actions.includes("Next")} />
                        </Toolbar.Group>
                    </Toolbar>
                    {current && <div className="flex-fill text-center">{current.title}</div>}
                </div>
            </div>
        </>;
    }
}

export default withDataFetch(PlayerCore, { usePreloader: false }, ({ udn }) => $api.control(udn).state(true).url());


