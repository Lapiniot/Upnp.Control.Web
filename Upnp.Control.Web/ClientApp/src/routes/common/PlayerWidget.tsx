import { ButtonHTMLAttributes, useCallback, useContext, useMemo } from "react";
import { Menu } from "../../components/Menu";
import Slider from "../../components/Slider";
import { parseMilliseconds } from "../../services/Extensions";
import { SwipeGestureRecognizer, SwipeGestures } from "../../services/gestures/SwipeGestureRecognizer";
import AlbumArt from "./AlbumArt";
import { PlaybackStateContext, PlaybackStateProvider, usePlaybackEventHandlers } from "./PlaybackStateContext";
import SeekBar from "./SeekBar";

function formatAlbumTitle(creator: string | undefined, album: string | undefined) {
    if (creator && album)
        return `${creator}\u00a0\u2022\u00a0${album}`;
    else
        return creator ?? album ?? "Unknown";
}

function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { glyph?: string; active?: boolean }) {
    const { className, glyph, children, active, ...other } = props;
    return <button type="button" className={`btn btn-icon${className ? ` ${className}` : ""}${active ? " text-primary" : ""}`} {...other}>
        {glyph && <svg><use href={glyph} /></svg>}{children}
    </button>
}

function PlayerCore({ udn }: { udn: string | undefined }) {
    const { dispatch, state: { state, current, relTime, duration, actions = [], next, playMode } } = useContext(PlaybackStateContext);
    const { play, pause, stop, prev: playPrev, next: playNext, seek, toggleMode } = usePlaybackEventHandlers(dispatch);

    const sgr = useMemo(() => new SwipeGestureRecognizer((_: unknown, gesture: SwipeGestures) => {
        switch (gesture) {
            case "swipe-left": dispatch({ type: "NEXT" }); break;
            case "swipe-right": dispatch({ type: "PREV" }); break;
        }
    }), []); // eslint-disable-line

    const refCallback = useCallback((e: HTMLDivElement) => { if (e) { sgr.bind(e) } else { sgr.unbind() } }, []); // eslint-disable-line

    const loading = state === "UNKNOWN" || state === undefined;
    const { title, album, creator } = current || {};
    const currentTime = parseMilliseconds(relTime as string);
    const totalTime = parseMilliseconds(duration as string);
    const buttonProps = state === "STOPPED" || state === "PAUSED_PLAYBACK"
        ? { title: "Play", glyph: "symbols.svg#play_circle", onClick: play }
        : state === "PLAYING"
            ? Number.isFinite(currentTime) && Number.isFinite(totalTime) && totalTime > 0
                ? { title: "Pause", glyph: "symbols.svg#pause_circle", onClick: pause }
                : { title: "Stop", glyph: "symbols.svg#stop_circle", onClick: stop }
            : { title: "Stop", glyph: "symbols.svg#stop_circle", disabled: true };

    const nextTitle = next ? `Next: ${next.artists && next.artists.length > 0 ? next.artists[0] : "Unknown artist"} \u2022 ${next.title}` : "Next";
    const shuffleMode = playMode === "REPEAT_SHUFFLE";

    return <div className="player-skeleton" ref={refCallback}>
        <AlbumArt className={`art rounded-1${loading ? " placeholder" : ""}`} itemClass={current?.class ?? "object.item.audioItem.musicTrack"} albumArts={current?.albumArts} hint="player" />
        <div className="pl-title">
            <h5 className={`text-truncate${loading ? " placeholder w-100" : ""}`}>{title ?? "[No media]"}</h5>
            <small className={`text-truncate${loading ? " placeholder w-75" : ""}`}>{formatAlbumTitle(creator, album)}</small>
        </div>
        <SeekBar className="pl-progress" time={currentTime} duration={totalTime} running={state === "PLAYING"} onChange={seek} />
        <Button title="Prev" className="pl-prev-btn" glyph="symbols.svg#skip_previous" onClick={playPrev} disabled={!actions.includes("Previous")} />
        <Button className="pl-main-btn p-1" {...buttonProps} />
        <Button title={nextTitle} className="pl-next-btn" glyph="symbols.svg#skip_next" onClick={playNext} disabled={!actions.includes("Next")} />
        <Button title={shuffleMode ? "Shuffle" : "Repeat all"} className="pl-mode-btn" glyph={`symbols.svg#${shuffleMode ? "shuffle" : "repeat"}`} onClick={toggleMode} disabled={loading} />
        <PlaybackStateProvider device={udn} trackVolume trackState={false}>
            <VolumeControl disabled={loading} />
        </PlaybackStateProvider>
    </div>
}

function VolumeControl({ className, ...other }: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { dispatch, state: { muted = false, volume = 0 } } = useContext(PlaybackStateContext);
    const { toggleMute, setVolume } = usePlaybackEventHandlers(dispatch);
    const volumeStr = muted ? "Muted" : `${volume}%`;
    const volumeIcon = muted ? "volume_off" : volume > 50 ? "volume_up" : volume > 20 ? "volume_down" : "volume_mute";
    return <>
        <Button {...other} title={volumeStr} className={`pl-volume-btn${className ? ` ${className}` : ""}`} glyph={`symbols.svg#${volumeIcon}`} data-toggle="dropdown" />
        <Menu className="volume-ctrl" mode="menu" placement="left-center">
            <li className="hstack">
                <button type="button" className="btn btn-icon ms-1" onClick={toggleMute}>
                    <svg><use href={"symbols.svg#" + (muted ? "volume_up" : "volume_off")} /></svg>
                </button>
                <Slider className="flex-fill mx-2" style={{ width: "10rem" }} value={volume / 100} onChange={setVolume} />
            </li>
        </Menu>
    </>
}

export default function ({ udn }: { udn: string | undefined }) {
    return <PlaybackStateProvider device={udn} trackPosition>
        <PlayerCore udn={udn} />
    </PlaybackStateProvider>
}