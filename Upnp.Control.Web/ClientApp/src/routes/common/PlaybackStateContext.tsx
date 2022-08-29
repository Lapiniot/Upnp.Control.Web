import { createContext, Dispatch, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";
import { nopropagation } from "../../components/Extensions";
import { useSignalR } from "../../components/SignalRListener";
import $api, { ControlApiProvider } from "../../components/WebApi";
import $s from "./Settings";

type AggregatedState = Partial<Upnp.AVState & Upnp.AVPosition & Upnp.RCState & { playlist: string }>

type InternalState = Partial<{ ctrl: ControlApiProvider }>

export type DispatchAction =
    { type: "UPDATE", state: AggregatedState & InternalState } |
    { type: "PLAY" | "PAUSE" | "STOP" | "PREV" | "NEXT" | "TOGGLE_MUTE" | "TOGGLE_MODE" } |
    { type: "SET_VOLUME", volume: number } |
    { type: "SEEK", position: number } |
    { type: "PLAY_URL", url: string }

export type PlaybackStateContextType = {
    state: AggregatedState,
    dispatch: React.Dispatch<DispatchAction>
}

export const PlaybackStateContext = createContext<PlaybackStateContextType>({
    state: {},
    dispatch() { }
})

type PlaybackStateProviderProps = PropsWithChildren<{ device: string }>;

function reducer(state: AggregatedState & InternalState, action: DispatchAction): AggregatedState {
    switch (action.type) {
        case "UPDATE":
            return { ...state, ...action.state };
        case "PLAY":
            state.ctrl?.play().fetch();
            break;
        case "STOP":
            state.ctrl?.stop().fetch();
            break;
        case "PAUSE":
            state.ctrl?.pause().fetch();
            break;
        case "PLAY_URL":
            state.ctrl?.playUri(action.url).fetch();
            break;
        case "PREV":
            state.ctrl?.prev().fetch();
            break;
        case "NEXT": state.ctrl?.next().fetch();
            break;
        case "SEEK":
            state.ctrl?.seek(action.position).fetch();
            break;
        case "SET_VOLUME":
            state.ctrl?.setVolume(Math.round(action.volume * 100)).fetch($s.get("timeout"));
            break;
        case "TOGGLE_MUTE":
            state.ctrl?.setMute(!state.muted).fetch();
            break;
        case "TOGGLE_MODE":
            state.ctrl?.setPlayMode(state.playMode === "REPEAT_ALL" ? "REPEAT_SHUFFLE" : "REPEAT_ALL").fetch($s.get("timeout"));
            break;
        default:
            throw new Error("Unsupported action type");
    }

    return state;
}

export function PlaybackStateProvider({ device, ...other }: PlaybackStateProviderProps) {
    const [state, dispatch] = useReducer(reducer, {});

    useEffect(() => {
        (async function () {
            try {
                if (!device) return;

                const timeout = $s.get("timeout");
                const ctrl = $api.control(device);
                const { 0: state, 1: position, 2: volume } = await Promise.all([
                    ctrl.state(true).json(timeout),
                    ctrl.position().json(timeout),
                    ctrl.volume(true).json(timeout)
                ]);

                if (state.medium === "X-MI-AUX" || (state.medium === "NONE" && state.current?.id === "1")) {
                    dispatch({ type: "UPDATE", state: { ctrl, ...state, ...position, ...volume, playlist: "aux" } });
                } else if (state.current?.vendor?.["mi:status"]) {
                    const pls = $api.playlist(device);
                    const { "playlist_transport_uri": playlist } = await pls.state().json(timeout);
                    dispatch({ type: "UPDATE", state: { ctrl, ...state, ...position, ...volume, playlist } });
                } else {
                    dispatch({ type: "UPDATE", state: { ctrl, ...state, ...position, ...volume, playlist: undefined } });
                }
            } catch (e) {
                console.error(e);
            }
        })()
    }, [device]);

    const handlers = useMemo(() => ({
        "AVTransportEvent": (target: string, { state, vendorProps = {} }: { state: Upnp.AVState, vendorProps: Record<string, string> }) => {
            if (device !== target) return;
            const { "mi:playlist_transport_uri": playlist, "mi:Transport": transport } = vendorProps;
            dispatch({ type: "UPDATE", state: { ...state, playlist: transport === "AUX" ? "aux" : playlist } });
        },
        "RenderingControlEvent": (target: string, { state }: { state: Upnp.RCState }) => {
            if (device !== target) return;
            dispatch({ type: "UPDATE", state: { ...state } });
        }
    }), [device]);

    useSignalR(handlers);

    const value = useMemo(() => ({ state, dispatch }), [state]);

    return <PlaybackStateContext.Provider {...other} value={value} />;
}

export function usePlaybackEventHandlers(dispatch: Dispatch<DispatchAction>) {
    return useMemo(() => {
        return {
            play: nopropagation(() => dispatch({ type: "PLAY" })),
            stop: nopropagation(() => dispatch({ type: "STOP" })),
            pause: nopropagation(() => dispatch({ type: "PAUSE" })),
            prev: nopropagation(() => dispatch({ type: "PREV" })),
            next: nopropagation(() => dispatch({ type: "NEXT" })),
            seek: (position: number) => dispatch({ type: "SEEK", position }),
            setVolume: (volume: number) => dispatch({ type: "SET_VOLUME", volume }),
            toggleMute: nopropagation(() => dispatch({ type: "TOGGLE_MUTE" })),
            toggleMode: nopropagation(() => dispatch({ type: "TOGGLE_MODE" })),
        }
    }, [dispatch]);
}

export function usePlaybackState() {
    return useContext(PlaybackStateContext);
}