declare namespace Upnp {
    type Icon = {
        w: number;
        h: number;
        url: string;
        mime?: string;
    }

    type Device = {
        udn: string;
        name: string;
        description: string;
        type: string;
        url: string;
        maker: string;
        makerUrl?: string;
        model: string;
        modelUrl?: string;
        modelNumber: string;
        presentUrl?: string;
        services: Service[];
        icons: Icon[];
    }

    type Service = {
        usn: string;
        url: string;
        type: string;
    }

    type BrowseFetchResult = {
        total: number;
        dev?: { name: string; desc: string };
        self?: DIDL.Item;
        items?: DIDL.Item[];
        parents?: DIDL.Item[];
    }

    type DeviceDescription = {
        udn: string;
        name: string;
        description: string;
    }

    type PlaybackState = "STOPPED" | "PLAYING" | "TRANSITIONING" | "PAUSED_PLAYBACK" | "PAUSED_RECORDING" | "RECORDING" | "NO_MEDIA_PRESENT" | "CUSTOM" | "UNKNOWN"

    type PlaybackStatus = "OK" | "ERROR_OCCURRED" | "CUSTOM"

    type PlaybackMode = "NORMAL" | "SHUFFLE" | "REPEAT_SHUFFLE" | "REPEAT_TRACK" | "REPEAT_ONE" | "REPEAT_ALL" | "RANDOM"

    type AVState = {
        state: PlaybackState;
        actions: string[];
        current?: DIDL.Item | null;
        next?: DIDL.Item | null;
        status?: PlaybackStatus;
        tracks?: number | null;
        medium?: string | null;
        playMode?: PlaybackMode;
        currentTrack?: string | null;
        currentTrackUri?: string | null;
    }

    type AVPosition = {
        currentTrack: string | undefined | null;
        current: DIDL.Item | undefined | null;
        relTime: string;
        duration: string;
    }

    type RCState = {
        volume: number;
        muted?: boolean;
    }

    namespace DIDL {
        type Resource = {
            proto: string;
            url: string;
            size?: number;
            duration?: string;
            resolution?: string;
            depth?: number;
            bitrate?: number;
            freq?: number;
            bits?: number;
            channels?: number;
            infoUri?: string;
            protection?: string;
        }

        type Item = {
            id: string;
            class: string;
            title: string;
            readonly?: boolean;
            container?: boolean;
            count?: number;
            containerCount?: number;
            creator?: string;
            album?: string;
            albumArts?: string[];
            artists?: string[];
            actors?: string[];
            authors?: string[];
            producers?: string[];
            directors?: string[];
            publishers?: string[];
            date?: string;
            genre?: string;
            genres?: string[];
            track?: number;
            discographyUrl?: string;
            lyricsUrl?: string;
            description?: string;
            storageUsed?: number;
            storageTotal?: number;
            storageFree?: number;
            storageMedium?: number;
            res?: Resource;
            vendor?: Record<string, string>;
        }
    }
}