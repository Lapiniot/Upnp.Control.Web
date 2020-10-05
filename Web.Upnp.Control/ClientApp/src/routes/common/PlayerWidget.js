import React from "react";
import Toolbar from "../../components/Toolbar";
import { withDataFetch } from "../../components/DataFetch";
import { SignalRListener } from "../../components/SignalR";
import $api from "../../components/WebApi";
import { Progress } from "./Progress";

class PlayerCore extends React.Component {
    constructor(props) {
        super(props);
        this.handlers = new Map([["AVTransportEvent", this.onAVTransportEvent]]);
        this.state = { actions: [], current: null, next: null, playbackState: null, dataContext: null, progress: 0 };
        this.ctrl = $api.control(this.props.udn);
    }

    static getDerivedStateFromProps(props, prevState) {
        return (props.dataContext !== prevState.dataContext && props.dataContext)
            ? {
                dataContext: props.dataContext,
                actions: props.dataContext.source.actions,
                current: props.dataContext.source.currentTrackMetadata,
                next: props.dataContext.source.nextTrackMetadata,
                playbackState: props.dataContext.source.state,
                playMode: props.dataContext.source.playMode
            }
            : null;
    }

    onAVTransportEvent = (device, { state: { actions, currentTrackMetadata: current, nextTrackMetadata: next, state, playMode }, position }) => {
        if (device === this.props.udn) {
            this.setState({
                actions,
                current,
                next,
                playMode,
                playbackState: state,
                time: position.relTime,
                duration: position.duration
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.udn !== this.props.udn) {
            this.ctrl = $api.control(this.props.udn);
        }
    }

    async componentDidMount() {
        try {
            const response = await this.ctrl.position().fetch();
            const position = await response.json();
            this.setState({ time: position.relTime, duration: position.duration });
        } catch (error) {
            console.error(error);
        }
    }

    play = () => this.ctrl.play().fetch();

    pause = () => this.ctrl.pause().fetch();

    stop = () => this.ctrl.stop().fetch();

    prev = () => this.ctrl.prev().fetch();

    next = () => this.ctrl.next().fetch();

    seek = position => this.ctrl.seek(position.toFixed(2)).fetch();

    render() {
        const { actions = [], current, next, playbackState, playMode, time, duration } = this.state;
        const { title, album, creator } = current || {};
        const transitioning = playbackState === "TRANSITIONING";
        
        const btnStyle = "no-outline p-1";
        const btnActiveStyle = `${btnStyle} text-primary`;
        const btnSmallStyle = `${btnStyle} py-0`;
        const btnLargeStyle = `${btnSmallStyle} fa-2x`;
        
        return <React.Fragment>
            <SignalRListener handlers={this.handlers}>{null}</SignalRListener>
            <div className="d-flex flex-column">
                <Progress time={time} duration={duration} running={playbackState === "PLAYING"} onChangeRequested={this.seek} />
                <div className="d-flex align-items-center justify-content-between">
                    <Toolbar>
                        <Toolbar.Group className="align-items-center">
                            <Toolbar.Button title="Prev" onClick={this.prev} glyph="step-backward fa-sm" className={btnSmallStyle} disabled={!actions.includes("Previous")} />
                            {actions.includes("Play") && <Toolbar.Button title="Play" onClick={this.play} glyph="play-circle" className={btnLargeStyle} />}
                            {(actions.includes("Pause") || transitioning) && <Toolbar.Button title="Pause" onClick={this.pause} glyph="pause-circle" className={btnLargeStyle} disabled={transitioning} />}
                            <Toolbar.Button title={next ? `Next: ${next.title}` : "Next"} onClick={this.next} glyph="step-forward fa-sm" className={btnSmallStyle} disabled={!actions.includes("Next")} />
                        </Toolbar.Group>
                    </Toolbar>
                    {current &&
                        <div className="d-flex flex-wrap justify-content-center mx-2 overflow-hidden">
                            <h6 className="text-center text-truncate flex-basis-100 m-0" title={title}>{title}</h6>
                            {creator && <small className="m-0">{creator}</small>}
                            {creator && album && <small>&nbsp;&bull;&nbsp;</small>}
                            {album && <small className="m-0">{album}</small>}
                        </div>}
                    <Toolbar className="flex-nowrap">
                        <Toolbar.Group>
                            <Toolbar.Button glyph="random" className={playMode === "REPEAT_SHUFFLE" ? btnActiveStyle : btnStyle} />
                            <Toolbar.Button glyph="retweet" className={playMode === "REPEAT_ALL" ? btnActiveStyle : btnStyle} />
                        </Toolbar.Group>
                        <Toolbar.Group>
                            <Toolbar.Button glyph="volume-off" className={btnStyle} />
                        </Toolbar.Group>
                    </Toolbar>
                </div>
            </div>
        </React.Fragment>;
    }
}

export default withDataFetch(PlayerCore, { usePreloader: false }, ({ udn }) => $api.control(udn).state(true).url());