import React, { ButtonHTMLAttributes, createRef } from "react";
import { DataContext, DataFetchProps, withDataFetch, withMemoKey } from "../../components/DataFetch";
import SignalRListener from "../../components/SignalRListener";
import $api from "../../components/WebApi";
import SeekBar from "./SeekBar";
import { AVPositionState, AVState, RCState } from "./Types";
import { parseMilliseconds } from "../../components/Extensions";
import { PlayerSvgSymbols } from "./SvgSymbols";
import $s from "./Settings";
import AlbumArt from "./AlbumArt";
import { DropdownMenu } from "../../components/DropdownMenu";
import Slider from "../../components/Slider";
import { SwipeGestureRecognizer, SwipeGestures } from "../../components/gestures/SwipeGestureRecognizer";

const STATE_UPDATE_DELAY_MS = 2000;

function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { glyph?: string; active?: boolean }) {
    const { className, glyph, children, active, ...other } = props;
    return <button type="button" className={`btn btn-round btn-icon btn-plain${className ? ` ${className}` : ""}${active ? " text-primary" : ""}`} {...other}>
        {glyph && <svg><use href={`#${glyph}`} /></svg>}{children}
    </button>
}

type PlayerProps = { udn: string; } & DataFetchProps<AVState>

type PlayerState = { dataContext?: DataContext<AVState> } & Partial<AVState> & Partial<RCState> & Partial<AVPositionState>

class PlayerCore extends React.Component<PlayerProps, PlayerState> {

    handlers;
    ctrl;
    stateUpdateTimeout: number | null = null;
    ref = createRef<HTMLDivElement>();
    swipeRecognizer: SwipeGestureRecognizer<HTMLDivElement>;

    constructor(props: PlayerProps) {
        super(props);
        this.handlers = {
            "AVTransportEvent": this.onAVTransportEvent,
            "RenderingControlEvent": this.onRenderingControlEvent
        };
        this.ctrl = $api.control(this.props.udn);
        this.state = {};
        this.swipeRecognizer = new SwipeGestureRecognizer(this.swipeGestureHandler);
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

    onRenderingControlEvent = (device: string, { state }: { state: RCState }) => {
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
        if (this.ref.current)
            this.swipeRecognizer.bind(this.ref.current);
    }

    componentWillUnmount() {
        this.cancelStateUpdate();
        this.swipeRecognizer.unbind();
    }

    play = () => this.ctrl.play().fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    pause = () => this.ctrl.pause().fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    stop = () => this.ctrl.stop().fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    prev = () => this.ctrl.prev().fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    next = () => this.ctrl.next().fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    seek = (position: number) => this.ctrl.seek(position).fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    setRepeatAllPlayMode = () => this.ctrl.setPlayMode("REPEAT_ALL").fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    togglePlayMode = () => this.ctrl.setPlayMode(this.state.playMode === "REPEAT_ALL" ? "REPEAT_SHUFFLE" : "REPEAT_ALL").fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    toggleMute = () => this.ctrl.setMute(!this.state.muted).fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    changeVolume = (volume: number) => this.ctrl.setVolume(Math.round(volume * 100)).fetch($s.get("timeout")).then(() => this.defferStateUpdate(STATE_UPDATE_DELAY_MS));

    private swipeGestureHandler = (_: HTMLDivElement, gesture: SwipeGestures) => {
        switch (gesture) {
            case "swipe-left": this.next(); break;
            case "swipe-right": this.prev(); break;
        }
    }

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

        const shuffleMode = playMode === "REPEAT_SHUFFLE";

        return <>
            <PlayerSvgSymbols />
            <SignalRListener callbacks={this.handlers} />
            <div className="player-skeleton" ref={this.ref}>
                <AlbumArt className="art" itemClass={current?.class ?? ".musicTrack"} albumArts={current?.albumArts} />
                <div className="title">
                    <h5 className="text-truncate mb-0">{title ?? "[No media]"}</h5>
                    {(creator || album) && <small className="text-truncate">{`${creator ?? ""}${creator && album ? "\u00a0\u2022\u00a0" : ""}${album ?? ""}`}</small>}
                </div>
                <SeekBar className="progress" time={currentTime} duration={totalTime} running={state === "PLAYING"} onChange={this.seek} />
                <Button title={shuffleMode ? "Shuffle" : "Repeat all"} className="mode-btn" glyph={shuffleMode ? "random" : "retweet"} onClick={this.togglePlayMode} disabled={disabled} />
                <Button title="Prev" className="prev-btn" glyph="step-backward" onClick={this.prev} disabled={!actions.includes("Previous")} />
                <Button className="play-btn p-1" {...button} />
                <Button title={nextTitle} className="next-btn" glyph="step-forward" onClick={this.next} disabled={!actions.includes("Next")} />
                <Button title={volumeStr} className="volume-btn" glyph={volumeIcon} disabled={disabled} data-bs-toggle="dropdown" />
                <DropdownMenu className="volume-ctrl" placement="left">
                    <li className="hstack">
                        <button type="button" style={{ zIndex: 1000 }} className="btn btn-plain btn-round" onClick={this.toggleMute}>
                            <svg><use href={"#" + (muted ? "volume-up" : "volume-mute")} /></svg>
                        </button>
                        <Slider className="flex-fill mx-2" style={{ width: "10rem" }} value={volume / 100} onChange={this.changeVolume} />
                    </li>
                </DropdownMenu>
            </div>
        </>;
    }
}

const fetchPromiseFactoryBuilder = ({ udn }: { udn: string }) => withMemoKey($api.control(udn as string).state(true).withTimeout($s.get("timeout")).jsonFetch, udn);

export default withDataFetch(PlayerCore, fetchPromiseFactoryBuilder, { usePreloader: false });