export type Icon = {
    w: number;
    h: number;
    url: string;
    mime?: string;
};

export type UpnpDevice = {
    udn: string;
    name: string;
    description: string;
    type: string;
    maker: string;
    makerUrl?: string;
    model: string;
    modelUrl?: string;
    modelNumber: string;
};

export type UpnpService = {
    usn: string;
    url: string;
}

export enum Services {
    MediaRenderer = "urn:schemas-upnp-org:device:MediaRenderer",
    ContentDirectory = "urn:schemas-upnp-org:service:ContentDirectory",
    UmiPlaylist = "urn:xiaomi-com:service:Playlist"
}

export type DataSourceProps<T = {}, P = {}> = P & {
    "data-source": T
    "data-row-id"?: string | number
}

export type DataFetchProps<T = {}, P = {}> = P & {
    dataContext: { source: T; reload: () => void };
    fetching: boolean;
    error: Error
}