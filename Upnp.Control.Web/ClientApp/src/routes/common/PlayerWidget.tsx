import Menu from "@components/Menu";
import Slider from "@components/Slider";
import { useAutoFocus } from "@hooks/AutoFocus";
import { useNavigator } from "@hooks/Navigator";
import AlbumArt from "@routes/common/AlbumArt";
import { PlaybackStateContext, usePlaybackEventHandlers } from "@routes/common/PlaybackStateContext";
import { PlaybackStateProvider } from "@routes/common/PlaybackStateProvider";
import SeekBar from "@routes/common/SeekBar";
import { parseMilliseconds } from "@services/Extensions";
import { SwipeGestureRecognizer, type SwipeGestures } from "@services/gestures/SwipeGestureRecognizer";
import $api from "@services/WebApi";
import { useCallback, useContext, useId, type ButtonHTMLAttributes, type MouseEvent } from "react";

function formatAlbumTitle(creator: string | undefined, album: string | undefined) {
    if (creator && album)
        return `${creator}\u00a0\u2022\u00a0${album}`;
    else
        return creator ?? album ?? "Unknown";
}

function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: string; active?: boolean }) {
    const { className, icon, children, active, ...other } = props;
    return <button type="button" className={`btn btn-icon${className ? ` ${className}` : ""}${active ? " text-primary" : ""}`} {...other}>
        {icon && <svg><use href={icon} /></svg>}{children}
    </button>
}

function PlayerCore({ udn }: { udn: string | undefined }) {
    const { dispatch, state: { state, current, relTime, duration, actions = [], next, playMode, vendor } } = useContext(PlaybackStateContext);
    const { play, pause, stop, prev: playPrev, next: playNext, seek, toggleMode } = usePlaybackEventHandlers(dispatch);

    const { navigate } = useNavigator();
    const navigateToPlaylist = useCallback((event: MouseEvent<HTMLDivElement>) => {
        const id = event.currentTarget.dataset["playlistId"];
        if (id) {
            navigate(`/umi/${udn}/playlists/PL:${id}`);
        }
    }, [udn, navigate]);

    const refCallback = useCallback((e: HTMLDivElement) => {
        const recognizer = new SwipeGestureRecognizer((_: unknown, gesture: SwipeGestures) => {
            switch (gesture) {
                case "swipe-left": dispatch({ type: "NEXT" }); break;
                case "swipe-right": dispatch({ type: "PREV" }); break;
            }
        });
        recognizer.bind(e);
        return () => {
            recognizer.unbind();
        }
    }, [dispatch]);

    const loading = state === "UNKNOWN" || state === undefined;
    const { title, album, creator } = current || {};
    const currentTime = parseMilliseconds(relTime as string);
    const totalTime = parseMilliseconds(duration as string);
    const buttonProps = state === "STOPPED" || state === "PAUSED_PLAYBACK"
        ? { title: "Play", icon: "symbols.svg#play_circle", onClick: play }
        : state === "PLAYING"
            ? Number.isFinite(currentTime) && Number.isFinite(totalTime) && totalTime > 0
                ? { title: "Pause", icon: "symbols.svg#pause_circle", onClick: pause }
                : { title: "Stop", icon: "symbols.svg#stop_circle", onClick: stop }
            : { title: "Stop", icon: "symbols.svg#stop_circle", disabled: true };

    const nextTitle = next ? `Next: ${next.artists && next.artists.length > 0 ? next.artists[0] : "Unknown artist"} \u2022 ${next.title}` : "Next";
    const shuffleMode = playMode === "REPEAT_SHUFFLE";
    const playlist = vendor?.["playlist_transport_uri"] ?? vendor?.["mi:playlist_transport_uri"];
    const playlistId = playlist && getPlaylistId(playlist);
    const clickHandler = playlistId ? navigateToPlaylist : undefined;

    const titleText = title ?? "[No media]";
    const albumTitleText = formatAlbumTitle(creator, album);

    return <div className="player-skeleton" ref={refCallback}>
        <AlbumArt className={`art${playlistId ? " cursor-pointer" : ""}${loading ? " placeholder" : ""}`} tabIndex={0}
            data-playlist-id={playlistId} onClick={clickHandler}
            itemClass={current?.class ?? "object.item.audioItem.musicTrack"} albumArts={current?.albumArts} hint="player" />
        <div className={`pl-title${playlistId ? " cursor-pointer" : ""}`} data-playlist-id={playlistId} onClick={clickHandler}>
            <h5 className={`text-truncate${loading ? " placeholder w-100" : ""}`}>{titleText}</h5>
            <small className={`text-truncate${loading ? " placeholder w-75" : ""}`}>{albumTitleText}</small>
        </div>
        <SeekBar className="pl-progress" time={currentTime} duration={totalTime} running={state === "PLAYING"} onChange={seek} />
        <Button title="Prev" className="pl-prev-btn" icon="symbols.svg#skip_previous" onClick={playPrev} disabled={!actions.includes("Previous")} />
        <Button className="pl-main-btn" {...buttonProps} />
        <Button title={nextTitle} className="pl-next-btn" icon="symbols.svg#skip_next" onClick={playNext} disabled={!actions.includes("Next")} />
        <Button title={shuffleMode ? "Shuffle" : "Repeat all"} className="pl-mode-btn" icon={`symbols.svg#${shuffleMode ? "shuffle" : "repeat"}`} onClick={toggleMode} disabled={loading} />
        <PlaybackStateProvider device={udn} trackVolume trackState={false}>
            <VolumeControl disabled={loading} />
        </PlaybackStateProvider>
    </div>
}

const regex = /^x-mi:\/\/.*\?id=([\d]+)$/;

function getPlaylistId(playlist: string) {
    const matches = regex.exec(playlist);
    return matches && matches.length === 2
        ? matches[1]
        : undefined;
}

function VolumeControl({ className, ...other }: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { dispatch, state: { muted = false, volume = 0 } } = useContext(PlaybackStateContext);
    const { toggleMute, setVolume } = usePlaybackEventHandlers(dispatch);
    const autoFocusRef = useAutoFocus<HTMLDivElement>();
    const id = useId();
    const volumeStr = muted ? "Muted" : `${volume}%`;
    const volumeIcon = muted ? "no_sound" : volume > 50 ? "volume_up" : volume > 20 ? "volume_down" : "volume_mute";
    return <>
        <Button {...other} popoverTarget={id} title={volumeStr} icon={`symbols.svg#${volumeIcon}`}
            className={`pl-volume-btn${className ? ` ${className}` : ""}`} />
        <Menu id={id} activation="explicit" className="volume-ctrl drop-left-center">
            <li className="hstack">
                <button type="button" className="btn btn-icon ms-1" onClick={toggleMute}>
                    <svg><use href={"symbols.svg#" + (muted ? "volume_up" : "volume_off")} /></svg>
                </button>
                <Slider ref={autoFocusRef} className="flex-fill mx-2 w-10r"
                    value={volume / 100} onChange={setVolume} />
            </li>
        </Menu>
    </>
}

function fetchPlaylistStateAsync(deviceId: string) {
    return $api.playlist(deviceId).state().json();
}

export default function PlayerWidget({ udn }: { udn: string | undefined }) {
    return <PlaybackStateProvider device={udn} trackPosition trackState fetchVendorState={fetchPlaylistStateAsync}>
        <PlayerCore udn={udn} />
    </PlaybackStateProvider>
}