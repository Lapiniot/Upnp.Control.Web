import React from "react";
import Toolbar from "../../components/Toolbar";
import { parseMilliseconds, formatTime } from "../../components/Extensions";
import { withDataFetch } from "../../components/DataFetch";
import { SignalRListener } from "../../components/SignalR";
import Timer from "../../components/Timer";
import $api from "../../components/WebApi";

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

    play = () => { return this.ctrl.play().fetch(); }

    pause = () => { return this.ctrl.pause().fetch(); }

    stop = () => { return this.ctrl.stop().fetch(); }

    prev = () => { return this.ctrl.prev().fetch(); }

    next = () => { return this.ctrl.next().fetch(); }

    changePosition = () => {};

    render() {
        const { actions = [], current, next, playbackState, playMode, time, duration } = this.state;
        const { title, album, creator } = current || {};
        const transitioning = playbackState === "TRANSITIONING";
        return <React.Fragment>
            <SignalRListener handlers={this.handlers}>{null}</SignalRListener>
            <div className="d-flex flex-column">
                <Progress time={time} duration={duration} running={playbackState === "PLAYING"} onChange={this.changePosition} />
                <div className="d-flex align-items-center justify-content-between">
                    <Toolbar>
                        <Toolbar.Group className="align-items-center">
                            <Toolbar.Button title="Prev" onClick={this.prev} glyph="step-backward fa-sm" className="p-0 px-1" disabled={!actions.includes("Previous")} />
                            {actions.includes("Play") && <Toolbar.Button title="Play" onClick={this.play} glyph="play-circle" className="fa-2x p-0 px-1" />}
                            {(actions.includes("Pause") || transitioning) && <Toolbar.Button title="Pause" onClick={this.pause} glyph="pause-circle" className="fa-2x p-0 px-1" disabled={transitioning} />}
                            <Toolbar.Button title={next ? `Next: ${next.title}` : "Next"} onClick={this.next} glyph="step-forward fa-sm" className="p-0 px-1" disabled={!actions.includes("Next")} />
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
                            <Toolbar.Button glyph="random" className={playMode === "REPEAT_SHUFFLE" ? "p-1 text-primary" : "p-1"} />
                            <Toolbar.Button glyph="retweet" className={playMode === "REPEAT_ALL" ? "p-1 text-primary" : "p-1"} />
                        </Toolbar.Group>
                        <Toolbar.Group>
                            <Toolbar.Button glyph="volume-off" className="p-2" />
                        </Toolbar.Group>
                    </Toolbar>
                </div>
            </div>
        </React.Fragment>;
    }
}

function changeProgress(e){
    alert(e.pageX - e.target.offsetLeft);
}

function Progress({ time, duration, running, onChange = ()=>{} }) {
    const total = parseMilliseconds(duration);
    const current = parseMilliseconds(time);
    
    if(!total) return null;
    
    const progress = total > 0 ? Math.round(current * 100 / total) : 0;

    return <div className="d-flex flex-wrap justify-content-between">
        <Timer className="text-tiny" current={current / 1000} total={total / 1000} running={running} />
        <small className="text-tiny">{formatTime(total / 1000)}</small>
        <div className="slider my-2 flex-basis-100" data-running={running} onClick={changeProgress} >
            <div className="slider-line" style={{ width: `${progress}%`, animationDuration: `${running ? (total - current) : 0}ms` }} />
            <div className="slider-ticker" />
        </div>
    </div>;
}

export default withDataFetch(PlayerCore, { usePreloader: false }, ({ udn }) => $api.control(udn).state(true).url());