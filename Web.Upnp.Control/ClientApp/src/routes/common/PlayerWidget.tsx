import React, { ButtonHTMLAttributes } from "react";
import { DataContext, DataFetchProps, withDataFetch, withMemoKey } from "../../components/DataFetch";
import { SignalRListener } from "../../components/SignalR";
import $api from "../../components/WebApi";
import SeekBar from "./SeekBar";
import Slider from "../../components/Slider";
import { AVPositionState, AVState, RCState } from "./Types";
import { parseMilliseconds } from "../../components/Extensions";
import { PlayerSvgSymbols } from "./SvgSymbols";
import $s from "./Settings";

const STATE_UPDATE_DELAY_MS = 2000;

function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { glyph?: string; active?: boolean }) {
    const { className, glyph, children, active, ...other } = props;
    return <button type="button" className={`btn btn-round btn-icon btn-plain p-1${className ? ` ${className}` : ""}${active ? " text-primary" : ""}`} {...other}>
        {glyph && <svg><use href={`#${glyph}`} /></svg>}{children}
    </button>
}

type PlayerProps = { udn: string; } & DataFetchProps<AVState>

type PlayerState = { dataContext?: DataContext<AVState> } & Partial<AVState> & Partial<RCState> & Partial<AVPositionState>

class PlayerCore extends React.Component<PlayerProps, PlayerState> {

    handlers;
    ctrl;
    stateUpdateTimeout: number | null = null;

    constructor(props: PlayerProps) {
        super(props);
        this.handlers = new Map<string, (...args: any[]) => void>([
            ["AVTransportEvent", this.onAVTransportEvent],
            ["RenderingControlEvent", this.onRenderingControlEvent]]);
        this.ctrl = $api.control(this.props.udn);
        this.state = {}
    }

    static getDerivedStateFromProps({ dataContext }: PlayerProps, prevState: PlayerState) {
        return (dataContext !== prevState.dataContext && dataContext)
            ? { dataContext, ...(dataContext?.source) }
            : null;
    }

    onAVTransportEvent = (device: string, { state, position }: { state: AVState; position: AVPositionState }) => {
        if (device === this.props.udn) {
            this.cancelStateUpdate();
            this.setState({ ...state, ...position });
        }
    }

    onRenderingControlEvent = (device: string, state: RCState) => {
        if (device === this.props.udn && (state.volume !== this.state.volume || state.muted && state.muted !== this.state.muted)) {
            this.cancelStateUpdate();
            this.setState(state);
        }
    }

    componentDidUpdate(prevProps: PlayerProps) {
        if (prevProps.udn !== this.props.udn) {
            this.ctrl = $api.control(this.props.udn);
        }
    }

    componentDidMount() {
        this.updateStateAsync();
    }

    componentWillUnmount() {
        this.cancelStateUpdate();
    }

    play = () => this.ctrl.play().fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    pause = () => this.ctrl.pause().fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    stop = () => this.ctrl.stop().fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    prev = () => this.ctrl.prev().fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    next = () => this.ctrl.next().fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    seek = (position: number) => this.ctrl.seek(position).fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    setRepeatAllPlayMode = () => this.ctrl.setPlayMode("REPEAT_ALL").fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    setRepeatShufflePlayMode = () => this.ctrl.setPlayMode("REPEAT_SHUFFLE").fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    toggleMute = () => this.ctrl.setMute(!this.state.muted).fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    changeVolume = (volume: number) => this.ctrl.setVolume(Math.round(volume * 100)).fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    private cancelStateUpdate = () => {
        if (this.stateUpdateTimeout) {
            clearTimeout(this.stateUpdateTimeout);
            this.stateUpdateTimeout = null;
        }
    }

    private defferStateUpdate(ms: number) {
        this.cancelStateUpdate();
        this.stateUpdateTimeout = window.setTimeout(() => this.updateStateAsync(), ms);
    }

    private updateStateAsync = async () => {
        try {
            const r = await Promise.all([
                await this.ctrl.position().jsonFetch($s.get("timeout")),
                await this.ctrl.volume(true).jsonFetch($s.get("timeout"))
            ]);

            const state = { ...r[0], ...r[1] };
            this.setState(state);
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        const { actions = [], current, next, state, playMode, relTime, duration, volume = 0, muted = false } = this.state;
        const { title, album, creator } = current || {};
        const nextTitle = next ? `${next.artists && next.artists.length > 0 ? next.artists[0] : "Unknown artist"} \u2022 ${next.title}` : "Next";
        const volumeStr = muted ? "Muted" : `${volume}%`;
        const volumeIcon = muted ? "volume-mute" : volume > 50 ? "volume-up" : volume > 20 ? "volume-down" : "volume-off";
        const disabled = !state;

        const currentTime = parseMilliseconds(relTime as string);
        const totalTime = parseMilliseconds(duration as string);

        const button = state === "STOPPED" || state === "PAUSED_PLAYBACK"
            ? { title: "Play", glyph: "play-circle", onClick: this.play }
            : state === "PLAYING"
                ? Number.isFinite(currentTime) && Number.isFinite(totalTime) && totalTime > 0
                    ? { title: "Pause", glyph: "pause-circle", onClick: this.pause }
                    : { title: "Stop", glyph: "stop-circle", onClick: this.stop }
                : { title: "Stop", glyph: "stop-circle", disabled: true };

        return <React.Fragment>
            <PlayerSvgSymbols />
            <SignalRListener handlers={this.handlers}>{null}</SignalRListener>
            <div className="d-flex flex-column">
                <SeekBar className="mb-2" time={currentTime} duration={totalTime} running={state === "PLAYING"} onChangeRequested={this.seek} />
                <div className="d-flex align-items-center flex-nowrap">
                    <Button title="Prev" glyph="step-backward" onClick={this.prev} disabled={!actions.includes("Previous")} />
                    <Button className="icon-2x" {...button} />
                    <Button title={nextTitle} glyph="step-forward" onClick={this.next} disabled={!actions.includes("Next")} />
                    <div className="d-flex flex-column flex-grow-1 overflow-hidden mx-2">
                        {current ? <>
                            <h6 className="text-center text-truncate flex-grow-1 m-0">{title}</h6>
                            {(creator || album) && <small className="m-0 text-center lines-2">{`${creator ?? ""}${creator && album ? "\u00a0\u2022\u00a0" : ""}${album ?? ""}`}</small>}
                        </> : <h6 className="text-center text-truncate flex-grow-1 m-0">[No media]</h6>}
                    </div>
                    <div className="d-flex position-relative flex-nowrap align-items-center">
                        <div className="hover-container">
                            <Button title={volumeStr} glyph={volumeIcon} onClick={this.toggleMute} disabled={disabled} />
                            {!disabled && <Slider progress={volume / 100} className="hover-activated position-absolute w-100 px-1" onChangeRequested={this.changeVolume} />}
                        </div>
                        <Button title="shuffle play mode" glyph="random" active={playMode === "REPEAT_SHUFFLE"} onClick={this.setRepeatShufflePlayMode} disabled={disabled} />
                        <Button title="repeat all play mode" glyph="retweet" active={playMode === "REPEAT_ALL"} onClick={this.setRepeatAllPlayMode} disabled={disabled} />
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
}

const fetchPromiseFactoryBuilder = ({ udn }: { udn: string }) => withMemoKey($api.control(udn as string).state(true).withTimeout($s.get("timeout")).jsonFetch, udn);

export default withDataFetch(PlayerCore, fetchPromiseFactoryBuilder, { usePreloader: false });