import React from "react";
import { withDataFetch } from "../../components/DataFetch";
import { SignalRListener } from "../../components/SignalR";
import { mergeClassNames as merge } from "../../components/Extensions";
import $api from "../../components/WebApi";
import Progress from "./Progress";

const PM_REPEAT_SHUFFLE = "REPEAT_SHUFFLE";
const PM_REPEAT_ALL = "REPEAT_ALL";

const ST_TRANSITIONING = "TRANSITIONING";
const ST_PLAYING = "PLAYING";

function Button(props) {
    const { className, glyph, children, active, ...other } = props;
    return <button type="button" className={merge`btn no-outline p-1 ${className} ${active && "text-primary"}`} {...other}>
        {glyph && <i className={`fas fa-${glyph}`} />}{children}
    </button>
}

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

    setRepeatAllPlayMode = () => this.ctrl.setPlayMode(PM_REPEAT_ALL).fetch();

    setRepeatShufflePlayMode = () => this.ctrl.setPlayMode(PM_REPEAT_SHUFFLE).fetch();

    render() {
        const { actions = [], current, next, playbackState, playMode, time, duration } = this.state;
        const { title, album, creator } = current || {};
        const transitioning = playbackState === ST_TRANSITIONING;
        const nextTitle = next ? `${next.artists && next.artists.length > 0 ? next.artists[0] : "Unknown artist"} \u2022 ${next.title}` : "Next";

        return <React.Fragment>
            <SignalRListener handlers={this.handlers}>{null}</SignalRListener>
            <div className="d-flex flex-column">
                <Progress time={time} duration={duration} running={playbackState === ST_PLAYING} onChangeRequested={this.seek} />
                <div className="d-flex align-items-center flex-nowrap">
                    <Button title="Prev" glyph="step-backward" className="py-0" onClick={this.prev} disabled={!actions.includes("Previous")} />
                    {actions.includes("Play") && <Button title="Play" glyph="play-circle" className="fa-2x" onClick={this.play} />}
                    {(actions.includes("Pause") || transitioning) && <Button title="Pause" glyph="pause-circle" className="fa-2x" onClick={this.pause} disabled={transitioning} />}
                    <Button title={nextTitle} glyph="step-forward" onClick={this.next} disabled={!actions.includes("Next")} />
                    {current &&
                        <div className="d-flex flex-wrap justify-content-center flex-grow-1 overflow-hidden mx-2">
                            <h6 className="text-center text-truncate flex-basis-100 m-0" title={title}>{title}</h6>
                            {creator && <small className="m-0">{creator}</small>}
                            {creator && album && <small>&nbsp;&bull;&nbsp;</small>}
                            {album && <small className="m-0">{album}</small>}
                        </div>}
                    <Button title="volume" glyph="volume-up" />
                    <Button title="shuffle play mode" glyph="random" active={playMode === PM_REPEAT_SHUFFLE} onClick={this.setRepeatShufflePlayMode} />
                    <Button title="repeat all play mode" glyph="retweet" active={playMode === PM_REPEAT_ALL} onClick={this.setRepeatAllPlayMode} />
                </div>
            </div>
        </React.Fragment>;
    }
}

export default withDataFetch(PlayerCore, { usePreloader: false }, ({ udn }) => $api.control(udn).state(true).url());