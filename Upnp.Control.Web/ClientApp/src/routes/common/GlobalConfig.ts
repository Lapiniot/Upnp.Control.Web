type Config = {
    placeholders: {
        count: number
    }
}

type Sections = "upnp" | "umi" | "renderers" | "browser-dialog-sources"

type GlobalConfig = Config & Partial<Record<Sections, Config>>

const config: GlobalConfig = {
    placeholders: { count: 4 },
    umi: { placeholders: { count: 1 } },
    renderers: { placeholders: { count: 2 } },
    "browser-dialog-sources": { placeholders: { count: 6 } }
}

export default config