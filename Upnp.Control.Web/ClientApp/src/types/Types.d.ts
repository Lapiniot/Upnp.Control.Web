type RecursivePartial<T> = T extends { [K in keyof T]: unknown }
    ? { [P in keyof T]?: RecursivePartial<T[P]> }
    : T

type RecursiveReadonly<T> = T extends { [K in keyof T]: unknown }
    ? { readonly [P in keyof T]: RecursiveReadonly<T[P]> }
    : T

type PromiseResult<T> = T extends Promise<infer U> ? U : T

declare namespace Configuration {
    type Sections = "upnp" | "umi" | "renderers" | "browser-dialog-sources"

    type SectionConfig = {
        useSkeletons: boolean,
        placeholders: {
            count: number,
            effect: "glow" | "wave"
        }
    }

    type Config = RecursiveReadonly<SectionConfig & RecursivePartial<Record<Sections, SectionConfig>>>
}

declare var $cfg: Configuration.Config

interface IExternalStore<T extends object> {
    getSnapshot(): T | undefined;
    subscribe(onStoreChange: () => void): () => void;
}

interface DataSourceProps<T> {
    dataSource?: T
}

interface TemplatedDataComponentProps<T> {
    itemTemplate: ComponentType<T>
}

type NotificationType = "appeared" | "disappeared" | "av-state" | "rc-state"

type DeviceCategory = "umi" | "renderers" | "upnp"