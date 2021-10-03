import { createContext, PropsWithChildren, UIEvent, UIEventHandler, useContext, useEffect, useMemo, useReducer } from "react";
import { nopropagation } from "../../../components/Extensions";
import { SignalRListener } from "../../../components/SignalR";
import $api from "../../../components/WebApi";
import $s from "../../common/Settings";
import { AVState, PlaybackState, PropertyBag } from "../../common/Types";

export type DispatchAction = { type: "UPDATE", state: Partial<PlaybackStateProviderState> }

interface PlaybackControlHandlers {
    play: UIEventHandler<HTMLElement>;
    stop: UIEventHandler<HTMLElement>;
    pause: UIEventHandler<HTMLElement>;
    playItem: UIEventHandler<HTMLElement>;
}

export type PlaybackStateContextType = {
    state: PlaybackState,
    playlist: string | undefined,
    track: string | undefined,
    dispatch: React.Dispatch<DispatchAction>;
    handlers: PlaybackControlHandlers
}

function noop() { }

export const PlaybackStateContext = createContext<PlaybackStateContextType>({
    state: "UNKNOWN",
    playlist: undefined,
    track: undefined,
    dispatch: noop,
    handlers: { play: noop, stop: noop, pause: noop, playItem: noop }
});

type PlaybackStateProviderProps = PropsWithChildren<{ device: string, getTrackUrlHook: (index: number) => string | undefined }>;

type PlaybackStateProviderState = {
    playbackState: PlaybackState,
    playlist: string | null | undefined,
    track: string | null | undefined
};

function reducer(state: PlaybackStateProviderState, action: DispatchAction): PlaybackStateProviderState {
    switch (action.type) {
        case "UPDATE":
            return { ...state, ...action.state };
        default:
            throw new Error("Unsupported action type");
    }
}

export function PlaybackStateProvider({ device, getTrackUrlHook, ...other }: PlaybackStateProviderProps) {
    const [state, dispatch] = useReducer(reducer, {
        playbackState: "UNKNOWN",
        playlist: undefined,
        track: undefined
    });

    useEffect(() => {
        (async function init() {
            try {
                const timeout = $s.get("timeout");
                const ctrl = $api.control(device);
                const state = await ctrl.state(true).jsonFetch(timeout);
                if (state.medium === "X-MI-AUX") {
                    dispatch({ type: "UPDATE", state: { playbackState: state.state, playlist: "aux", track: undefined } });
                } else {
                    const pls = $api.playlist(device);
                    const { 0: { "playlist_transport_uri": playlist }, 1: { currentTrack } } = await Promise.all([
                        await pls.state().jsonFetch(timeout),
                        await ctrl.position().jsonFetch(timeout)
                    ]);
                    dispatch({ type: "UPDATE", state: { playbackState: state.state, playlist, track: currentTrack } });
                }
            } catch (e) {
                console.error(e);
            }
        })();
    }, [device]);

    const handlers = useMemo(() => ({
        "AVTransportEvent": (target: string, { state, vendorProps = {} }: { state: AVState, vendorProps: PropertyBag }) => {
            if (device !== target) return;
            const { state: playbackState, currentTrack: track } = state;
            const { "mi:playlist_transport_uri": playlist, "mi:Transport": transport } = vendorProps;
            dispatch({
                type: "UPDATE",
                state: { playbackState, track, playlist: transport === "AUX" ? "aux" : playlist }
            });
        }
    }), [device]);

    const uiHandlers = useMemo(() => {
        const ctrl = $api.control(device);
        return {
            play: nopropagation(() => ctrl.play().fetch()),
            stop: nopropagation(() => ctrl.stop().fetch()),
            pause: nopropagation(() => ctrl.stop().fetch()),
            playItem: nopropagation(({ currentTarget: { dataset: { index } } }: UIEvent<HTMLElement>) => {
                if (index) {
                    const url = getTrackUrlHook(parseInt(index));
                    if (url) {
                        ctrl.playUri(url).fetch()
                    }
                }
            })
        }
    }, [device, getTrackUrlHook]);

    const value = useMemo(() => ({
        state: state.playbackState,
        playlist: state.playlist ?? undefined,
        track: state.track ?? undefined,
        dispatch,
        handlers: uiHandlers
    }), [state.playbackState, state.playlist, state.track, uiHandlers]);

    return <>
        <SignalRListener callbacks={handlers} />
        <PlaybackStateContext.Provider {...other} value={value} />
    </>
}

export function usePlaybackState() {
    return useContext(PlaybackStateContext);
}