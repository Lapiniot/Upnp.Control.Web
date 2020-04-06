import React from "react";
import Toolbar from "./Toolbar";
import { withDataFetch } from "./Extensions";
import { SignalRListener } from "./SignalR"

class PlayerCore extends React.Component {
    constructor(props) {
        super(props);
        this.handlers = new Map([["AVTransportEvent", this.onAVTransportEvent]]);
        this.state = { actions: [], current: null, next: null, playbackState: null };
    }

    onAVTransportEvent = (device, { state: { actions, current, next, state } }) => {
        if (device === this.props.udn) {
            this.setState({ actions: actions, current: current, next: next, playbackState: state })
        }
    }

    static getDerivedStateFromProps({ dataContext, dataContext: { source } = {} } = {}, prevState) {
        return (dataContext !== prevState.dataContext) ? {
            dataContext: dataContext, actions: source.actions,
            current: source.current, next: source.next, playbackState: source.state
        } : null;
    }

    render() {
        const { actions = [], current, next, playbackState } = this.state;
        const transitioning = playbackState === "TRANSITIONING";
        return <>
            <SignalRListener handlers={this.handlers} >{null}</SignalRListener>
            <div className="d-flex flex-column mr-auto">
                {current && <div>{current.title}</div>}
                <Toolbar className="bg-normal">
                    <Toolbar.Group>
                        <Toolbar.Button title="Prev" glyph="step-backward" disabled={!actions.includes("Previous")} />
                        {actions.includes("Play") && <Toolbar.Button title="Play" glyph="play" />}
                        {(actions.includes("Pause") || transitioning) && <Toolbar.Button title="Pause" glyph="pause" disabled={transitioning} />}
                        <Toolbar.Button title={next ? `Next: ${next.title}` : "Next"} glyph="step-forward" disabled={!actions.includes("Next")} />
                    </Toolbar.Group>
                </Toolbar>
            </div>
        </>;
    }
}

export default withDataFetch(PlayerCore, { usePreloader: false }, ({ udn }) => `/api/upnpcontrol/${udn}/state?detailed`);



