type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> }

type RecursiveReadonly<T> = { readonly [P in keyof T]: RecursiveReadonly<T[P]> }

type PromiseResult<T> = T extends Promise<infer U> ? U : T

namespace Configuration {
    type Sections = "upnp" | "umi" | "renderers" | "browser-dialog-sources"

    type SectionConfig = {
        useSkeletons: boolean,
        placeholders: {
            count: number,
            effect: "glow" | "wave"
        }
    }

    type Config = RecursiveReadonly<SectionConfig> & RecursiveReadonly<RecursivePartial<Record<Sections, SectionConfig>>>
}

var $cfg: Configuration.Config

interface DataSourceProps<T> {
    dataSource?: T
}

interface TemplatedDataComponentProps<T> {
    itemTemplate: ComponentType<T>
}

type NotificationType = "appeared" | "disappeared" | "av-state" | "rc-state"

type DeviceCategory = "umi" | "renderers" | "upnp"