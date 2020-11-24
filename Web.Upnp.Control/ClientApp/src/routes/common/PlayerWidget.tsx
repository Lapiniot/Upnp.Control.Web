import React, { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { DataContext, DataFetchProps, withDataFetch, withMemoKey } from "../../components/DataFetch";
import { SignalRListener } from "../../components/SignalR";
import $api from "../../components/WebApi";
import Progress from "./Progress";
import Slider from "../../components/Slider";
import $c from "./Config";
import { DIDLItem } from "./Types";

const PM_REPEAT_SHUFFLE = "REPEAT_SHUFFLE";
const PM_REPEAT_ALL = "REPEAT_ALL";

const ST_TRANSITIONING = "TRANSITIONING";
const ST_PLAYING = "PLAYING";

function Button(props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { glyph?: string; active?: boolean }>) {
    const { className, glyph, children, active, ...other } = props;
    return <button type="button" className={`btn no-outline p-1${className ? ` ${className}` : ""}${active ? " text-primary" : ""}`} {...other}>
        {glyph && <i className={`fas fa-${glyph}`} />}{children}
    </button>
}

type AVState = {
    actions?: string[];
    currentTrackMetadata?: DIDLItem;
    nextTrackMetadata?: DIDLItem;
    state?: string;
    playMode: string;
};

type PlayerProps = {
    udn: string;
} & DataFetchProps<AVState>

type RCState = {
    volume?: number;
    muted?: boolean;
};

type PlayerState = {
    dataContext?: DataContext<AVState>;
    actions?: string[];
    current?: DIDLItem;
    next?: DIDLItem;
    playbackState?: string;
    playMode?: string;
    progress?: number;
    time?: string;
    duration?: string;
} & RCState

type AVPositionState = {
    relTime?: string;
    duration?: string;
};

class PlayerCore extends React.Component<PlayerProps, PlayerState> {

    handlers;
    ctrl;

    constructor(props: PlayerProps) {
        super(props);
        this.handlers = new Map<string, (...args: any[]) => void>([
            ["AVTransportEvent", this.onAVTransportEvent],
            ["RenderingControlEvent", this.onRenderingControlEvent]]);
        this.ctrl = $api.control(this.props.udn);
        this.state = {}
    }

    static getDerivedStateFromProps(props: PlayerProps, prevState: PlayerState) {
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

    onAVTransportEvent = (device: string, { state, position }: { state: AVState; position: AVPositionState }) => {
        if (device === this.props.udn) {
            this.setState({
                actions: state.actions,
                current: state.currentTrackMetadata,
                next: state.nextTrackMetadata,
                playMode: state.playMode,
                playbackState: state.state,
                time: position.relTime,
                duration: position.duration
            });
        }
    }

    onRenderingControlEvent = (device: string, state: RCState) => {
        if (device === this.props.udn) {
            this.setState(state);
        }
    }

    componentDidUpdate(prevProps: PlayerProps) {
        if (prevProps.udn !== this.props.udn) {
            this.ctrl = $api.control(this.props.udn);
        }
    }

    async componentDidMount() {
        try {
            const { 0: { relTime, duration }, 1: { volume, muted } } =
                await Promise.all([
                    await this.ctrl.position().jsonFetch($c.timeout),
                    await this.ctrl.volume(true).jsonFetch($c.timeout)]);

            this.setState({ time: relTime, duration, volume, muted });
        } catch (error) {
            console.error(error);
        }
    }

    play = () => this.ctrl.play().fetch($c.timeout);

    pause = () => this.ctrl.pause().fetch($c.timeout);

    stop = () => this.ctrl.stop().fetch($c.timeout);

    prev = () => this.ctrl.prev().fetch($c.timeout);

    next = () => this.ctrl.next().fetch($c.timeout);

    seek = (position: number) => this.ctrl.seek(position).fetch($c.timeout);

    setRepeatAllPlayMode = () => this.ctrl.setPlayMode(PM_REPEAT_ALL).fetch($c.timeout);

    setRepeatShufflePlayMode = () => this.ctrl.setPlayMode(PM_REPEAT_SHUFFLE).fetch($c.timeout);

    toggleMute = () => this.ctrl.setMute(!this.state.muted).fetch($c.timeout);

    changeVolume = (volume: number) => this.ctrl.setVolume(Math.round(volume * 100)).fetch($c.timeout);

    render() {
        const { actions = [], current, next, playbackState, playMode, time, duration, volume = 0, muted = false } = this.state;
        const { title, album, creator } = current || {};
        const transitioning = playbackState === ST_TRANSITIONING;
        const nextTitle = next ? `${next.artists && next.artists.length > 0 ? next.artists[0] : "Unknown artist"} \u2022 ${next.title}` : "Next";
        const volumeStr = muted ? "Muted" : `${volume}%`;
        const volumeIcon = muted ? "volume-mute" : volume > 50 ? "volume-up" : volume > 20 ? "volume-down" : "volume-off";

        return <React.Fragment>
            <i data-fa-symbol="volume-mute" className="fas fa-volume-mute" />
            <i data-fa-symbol="volume-off" className="fas fa-volume-off" />
            <i data-fa-symbol="volume-down" className="fas fa-volume-down" />
            <i data-fa-symbol="volume-up" className="fas fa-volume-up" />
            <SignalRListener handlers={this.handlers}>{null}</SignalRListener>
            <div className="d-flex flex-column">
                {time && duration && <Progress className="mb-2" time={time} duration={duration} running={playbackState === ST_PLAYING} onChangeRequested={this.seek} />}
                <div className="d-flex align-items-center flex-nowrap">
                    <Button title="Prev" glyph="step-backward" className="py-0" onClick={this.prev} disabled={!actions.includes("Previous")} />
                    {actions.includes("Play") && <Button title="Play" glyph="play-circle" className="fa-2x" onClick={this.play} />}
                    {(actions.includes("Pause") || transitioning) && <Button title="Pause" glyph="pause-circle" className="fa-2x" onClick={this.pause} disabled={transitioning} />}
                    <Button title={nextTitle} glyph="step-forward" onClick={this.next} disabled={!actions.includes("Next")} />
                    {current &&
                        <div className="d-flex flex-wrap justify-content-center flex-grow-1 overflow-hidden mx-2">
                            <h6 className="text-center text-truncate flex-basis-100 m-0">{title}</h6>
                            {(creator || album) && <small className="m-0 text-center lines-2">{`${creator ?? ""}${creator && album ? "\u00a0\u2022\u00a0" : ""}${album ?? ""}`}</small>}
                        </div>}
                    <div className="d-flex position-relative flex-nowrap">
                        <div className="hover-container">
                            <Button title={volumeStr} onClick={this.toggleMute}>
                                <svg className="svg-inline--fa fa-w-16"><use href={`#${volumeIcon}`} /></svg>
                            </Button>
                            <Slider progress={volume / 100} className="hover-activated position-absolute w-100 px-1" onChangeRequested={this.changeVolume} />
                        </div>
                        <Button title="shuffle play mode" glyph="random" active={playMode === PM_REPEAT_SHUFFLE} onClick={this.setRepeatShufflePlayMode} />
                        <Button title="repeat all play mode" glyph="retweet" active={playMode === PM_REPEAT_ALL} onClick={this.setRepeatAllPlayMode} />
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
}

const fetchPromiseFactoryBuilder = ({ udn }: { udn: string }) => withMemoKey($api.control(udn as string).state(true).withTimeout($c.timeout).jsonFetch, udn);

export default withDataFetch(PlayerCore, fetchPromiseFactoryBuilder, { usePreloader: false });