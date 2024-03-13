import { createContext, Dispatch, PropsWithChildren, useEffect, useMemo, useReducer } from "react";
import { useSignalR } from "../../hooks/SignalR";
import $api, { ControlApiClient } from "../../services/WebApi";
import $s from "./Settings";

type MediaState = Partial<Upnp.AVState & Upnp.AVPosition & Upnp.RCState & { vendor: Record<string, string> }>

type FetchStateFlagKeys = "trackState" | "trackPosition" | "trackVolume"

type FetchStateFlags = { [K in FetchStateFlagKeys]?: boolean }

type Fetch<A, R> = (arg: A) => Promise<R>

type InternalState = {
    client?: ControlApiClient,
    dispatch?: Dispatch<StateAction>,
    fetch?: Fetch<ControlApiClient, MediaState>,
    media?: MediaState
}

type MediaAction =
    { type: "PLAY" | "PAUSE" | "STOP" | "PREV" | "NEXT" | "TOGGLE_MUTE" | "TOGGLE_MODE" } |
    { type: "PLAY_URL", url: string } |
    { type: "SET_VOLUME", volume: number } |
    { type: "SEEK", position: number } |
    { type: "REFRESH" }

type StateAction =
    { type: "BEGIN_INIT", device: string, dispatch: Dispatch<StateAction>, fetch: Fetch<ControlApiClient, MediaState> } |
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

type RCEventArgs = {
    state: Upnp.RCState
}

type AVTEventArgs = {
    state: Upnp.AVState,
    position: Upnp.AVPosition,
    vendorProps: Record<string, string>
}

type PlaybackStateProviderProps = PropsWithChildren<{
    device: string | undefined | null,
    fetchVendorState?(deviceId: string): Promise<Record<string, string>>
} & FetchStateFlags>

function reducer(state: InternalState, action: StateAction | MediaAction) {
    switch (action.type) {
        case "BEGIN_INIT": {
            const { device, dispatch, fetch } = action;
            const client = $api.control(device);
            fetch(client)
                .then(media => dispatch({ type: "END_INIT", state: { media, client, dispatch, fetch } }))
                .catch(error => console.error(error));
            break;
        }
        case "END_INIT":
            return action.state;
        case "UPDATE":
            return { ...state, media: { ...state.media, ...action.state } };
        case "REFRESH":
            {
                const { client, dispatch, fetch } = state;
                if (client && dispatch && fetch) {
                    fetch(client)
                        .then(state => dispatch({ type: "UPDATE", state }))
                        .catch(error => console.error(error));
                } else {
                    throw new Error("Invalid state. Not ready.")
                }
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

function createFetch(fetchState: boolean, fetchPosition: boolean, fetchVolume: boolean, fetchVendorState?: (id: string) => Promise<Record<string, string>>) {
    return async function (client: ControlApiClient): Promise<MediaState> {
        const timeout = $s.get("timeout");

        const { 0: state, 1: position, 2: volume, 3: vendor } = await Promise.all([
            fetchState ? client.state(true).json(timeout) : Promise.resolve({}),
            fetchPosition ? client.position().json(timeout) : Promise.resolve({}),
            fetchVolume ? client.volume(true).json(timeout) : Promise.resolve({}),
            fetchVendorState?.(client.deviceId) ?? Promise.resolve({})
        ]);

        return { ...state, ...position, ...volume, vendor };
    }
}

const initialState = {};

export function PlaybackStateProvider({ device, trackState = true, trackPosition = false, trackVolume = false, fetchVendorState, ...other }: PlaybackStateProviderProps) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (device) dispatch({ type: "BEGIN_INIT", device, dispatch, fetch: createFetch(trackState, trackPosition, trackVolume, fetchVendorState) })
    }, [device, trackState, trackPosition, trackVolume, fetchVendorState]);

    const handlers = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handlers = {} as Record<string, (...args: any[]) => void>;

        if (trackState || trackPosition || fetchVendorState) {
            handlers["AVTransportEvent"] = (target: string, { state, position, vendorProps = {} }: AVTEventArgs) => {
                if (device === target) {
                    dispatch({
                        type: "UPDATE",
                        state: {
                            ...(trackState ? state : {}),
                            ...(trackPosition ? position : {}),
                            vendor: fetchVendorState ? vendorProps : undefined
                        }
                    })
                }
            }
        }

        if (trackVolume) {
            handlers["RenderingControlEvent"] = (target: string, { state }: RCEventArgs) => {
                if (device === target) {
                    dispatch({ type: "UPDATE", state: { ...state } })
                }
            }
        }

        return handlers;
    }, [device, trackState, trackPosition, trackVolume, fetchVendorState]);

    useSignalR(handlers);

    const value = useMemo(() => ({ state: state.media ?? {}, dispatch }), [state.media]);

    return <PlaybackStateContext.Provider {...other} value={value} />;
}

export function usePlaybackEventHandlers(dispatch: Dispatch<MediaAction>) {
    return useMemo(() => ({
        play: () => dispatch({ type: "PLAY" }),
        stop: () => dispatch({ type: "STOP" }),
        pause: () => dispatch({ type: "PAUSE" }),
        prev: () => dispatch({ type: "PREV" }),
        next: () => dispatch({ type: "NEXT" }),
        seek: (position: number) => dispatch({ type: "SEEK", position }),
        setVolume: (volume: number) => dispatch({ type: "SET_VOLUME", volume }),
        toggleMute: () => dispatch({ type: "TOGGLE_MUTE" }),
        toggleMode: () => dispatch({ type: "TOGGLE_MODE" }),
        refresh: () => dispatch({ type: "REFRESH" })
    }), [dispatch]);
}