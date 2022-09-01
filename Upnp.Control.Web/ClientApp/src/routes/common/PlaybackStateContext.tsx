import { createContext, Dispatch, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";
import { nopropagation } from "../../components/Extensions";
import { useSignalR } from "../../components/SignalRListener";
import $api, { ControlApiClient } from "../../components/WebApi";
import $s from "./Settings";

type MediaState = Partial<Upnp.AVState & Upnp.AVPosition & Upnp.RCState & { playlist: string }>

type InternalState = {
    client?: ControlApiClient,
    dispatch?: Dispatch<StateAction>,
    media?: MediaState
}

type MediaAction =
    { type: "PLAY" | "PAUSE" | "STOP" | "PREV" | "NEXT" | "TOGGLE_MUTE" | "TOGGLE_MODE" } |
    { type: "PLAY_URL", url: string } |
    { type: "SET_VOLUME", volume: number } |
    { type: "SEEK", position: number } |
    { type: "REFRESH" }

type StateAction =
    { type: "BEGIN_INIT", device: string, dispatch: Dispatch<StateAction> } |
    { type: "END_INIT", state: Required<InternalState> } |
    { type: "UPDATE", state: MediaState }

export type PlaybackStateContextType = {
    state: MediaState,
    dispatch: React.Dispatch<MediaAction>
}

export const PlaybackStateContext = createContext<PlaybackStateContextType>({
    state: {},
    dispatch() { }
})

type PlaybackStateProviderProps = PropsWithChildren<{ device: string | undefined | null }>;

function reducer(state: InternalState, action: StateAction | MediaAction) {
    switch (action.type) {
        case "BEGIN_INIT": {
            const { device, dispatch } = action;
            const client = $api.control(device);
            fetchStateAsync(client)
                .then(media => dispatch({ type: "END_INIT", state: { media, client, dispatch } }))
                .catch(error => console.error(error));
            break;
        }
        case "END_INIT":
            return action.state;
        case "UPDATE":
            return { ...state, media: { ...state.media, ...action.state } };
        case "REFRESH":
            const { client, dispatch } = state;
            if (client && dispatch) {
                fetchStateAsync(client)
                    .then(state => dispatch({ type: "UPDATE", state }))
                    .catch(error => console.error(error));
            } else {
                throw new Error("Invalid state. Not ready.")
            }
            break;
        case "PLAY":
            state.client?.play().fetch();
            break;
        case "STOP":
            state.client?.stop().fetch();
            break;
        case "PAUSE":
            state.client?.pause().fetch();
            break;
        case "PLAY_URL":
            state.client?.playUri(action.url).fetch();
            break;
        case "PREV":
            state.client?.prev().fetch();
            break;
        case "NEXT": state.client?.next().fetch();
            break;
        case "SEEK":
            state.client?.seek(action.position).fetch();
            break;
        case "SET_VOLUME":
            state.client?.setVolume(Math.round(action.volume * 100)).fetch($s.get("timeout"));
            break;
        case "TOGGLE_MUTE":
            state.client?.setMute(!state.media?.muted).fetch();
            break;
        case "TOGGLE_MODE":
            state.client?.setPlayMode(state.media?.playMode === "REPEAT_ALL" ? "REPEAT_SHUFFLE" : "REPEAT_ALL").fetch($s.get("timeout"));
            break;
        default:
            throw new Error("Unsupported action type");
    }

    return state;
}

function initializer() { return {} }

async function fetchStateAsync(client: ControlApiClient): Promise<MediaState> {
    const timeout = $s.get("timeout");

    const { 0: state, 1: position, 2: volume } = await Promise.all([
        client.state(true).json(timeout),
        client.position().json(timeout),
        client.volume(true).json(timeout)
    ]);

    if (state.medium === "X-MI-AUX" || (state.medium === "NONE" && state.current?.id === "1")) {
        return { ...state, ...position, ...volume, playlist: "aux" };
    } else if (state.current?.vendor?.["mi:status"]) {
        const pls = $api.playlist(client.deviceId);
        const { "playlist_transport_uri": playlist } = await pls.state().json(timeout);
        return { ...state, ...position, ...volume, playlist };
    } else {
        return { ...state, ...position, ...volume, playlist: undefined };
    }
}

export function PlaybackStateProvider({ device, ...other }: PlaybackStateProviderProps) {
    const [state, dispatch] = useReducer(reducer, undefined, initializer);

    useEffect(() => { if (device) dispatch({ type: "BEGIN_INIT", device, dispatch }) }, [device]);

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

    const value = useMemo(() => ({ state: state.media ?? {}, dispatch }), [state.media]);

    return <PlaybackStateContext.Provider {...other} value={value} />;
}

export function usePlaybackEventHandlers(dispatch: Dispatch<MediaAction>) {
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
            refresh: () => dispatch({ type: "REFRESH" })
        }
    }, [dispatch]);
}

export function usePlaybackState() {
    return useContext(PlaybackStateContext);
}