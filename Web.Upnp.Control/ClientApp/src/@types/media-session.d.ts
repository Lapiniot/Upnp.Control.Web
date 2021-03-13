declare global {
    type MediaSessionPlaybackState = "none" | "paused" | "playing";

    type MediaSessionAction = "play" | "pause" | "seekbackward" | "seekforward" | "previoustrack" | "nexttrack" | "skipad" | "stop" | "seekto";

    type MediaImage = {
        src: string,
        sizes?: string,
        type?: string
    }

    type MediaMetadataInit = {
        title: string,
        artist: string,
        album: string;
        artwork: Iterable<MediaImage>;
    }

    type MediaPositionState = {
        duration: number,
        playbackRate: number,
        position: number
    };

    type MediaSessionActionDetails = {
        action: MediaSessionAction,
        seekOffset?: number,
        seekTime?: number,
        fastSeek?: boolean
    };

    type MediaSessionActionHandler = (details: MediaSessionActionDetails) => void;

    interface MediaMetadata {
        title: string,
        artist: string,
        album: string,
        artwork: ReadonlyArray<MediaImage>
    }

    interface MediaSession {
        metadata?: MediaMetadata,
        playbackState: MediaSessionPlaybackState,
        setActionHandler: (action: MediaSessionAction, handler: MediaSessionActionHandler) => void
        setPositionState: (state: MediaPositionState) => void;
    }

    interface Navigator {
        mediaSession: MediaSession;
    }

    declare var MediaMetadata: {
        prototype: MediaMetadata,
        new(init?: MediaMetadataInit);
    }
}

export { }