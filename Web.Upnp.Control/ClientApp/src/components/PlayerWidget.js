import React from "react";
import Toolbar from "./Toolbar";
import { withDataFetch } from "./Extensions";
import { SignalRListener } from "./SignalR"

class PlayerCore extends React.Component {
    constructor(props) {
        super(props);
        this.handlers = new Map([["UpnpEvent", this.onUpnpEvent]]);
        this.state = { actions: [], current: null, next: null };
    }

    onUpnpEvent = (device, message) => {
        if (device === this.props.udn) {
            this.setState({
                actions: message.state.actions,
                current: message.state.current,
                next: message.state.next
            })
        }
    }

    static getDerivedStateFromProps({ dataContext }, state) {
        return (dataContext != state.dataContext) ? {
            dataContext: dataContext,
            actions: dataContext.source.actions,
            current: dataContext.source.current,
            next: dataContext.source.next
        } : null;
    }

    render() {
        const { actions = [], current, next } = this.state;

        return <SignalRListener handlers={this.handlers}>
            <div className="d-flex flex-column mr-auto">
                {current && <div>{current.title}</div>}
                <Toolbar className="bg-normal">
                    <Toolbar.Group>
                        <Toolbar.Button title="Prev" glyph="step-backward" disabled={!actions.includes("Previous")} />
                        {actions.includes("Play") && <Toolbar.Button title="Play" glyph="play" />}
                        {actions.includes("Pause") && <Toolbar.Button title="Pause" glyph="pause" />}
                        <Toolbar.Button title={next ? `Next: ${next.title}` : "Next"} glyph="step-forward" disabled={!actions.includes("Next")} />
                    </Toolbar.Group>
                </Toolbar>
            </div>
        </SignalRListener>;
    }
}

export default withDataFetch(PlayerCore, { usePreloader: false }, ({ udn }) => `/api/upnpcontrol/${udn}/state?detailed`);



