import { createContext, useMemo, type Dispatch } from "react";

export type MediaState = Partial<Upnp.AVState & Upnp.AVPosition & Upnp.RCState & { vendor: Record<string, string> }>

export type MediaAction =
    { type: "PLAY" | "PAUSE" | "STOP" | "PREV" | "NEXT" | "TOGGLE_MUTE" | "TOGGLE_MODE" } |
    { type: "PLAY_URL", url: string } |
    { type: "SET_VOLUME", volume: number } |
    { type: "SEEK", position: number } |
    { type: "REFRESH" }

type PlaybackStateContextType = {
    state: MediaState,
    dispatch: React.Dispatch<MediaAction>
}

export const PlaybackStateContext = createContext<PlaybackStateContextType>({
    state: {},
    dispatch() { }
})

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