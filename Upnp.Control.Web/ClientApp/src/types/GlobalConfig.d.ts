type Config = {
    placeholders: {
        count: number,
        effect: "glow" | "wave"
    }
}

type Sections = "upnp" | "umi" | "renderers" | "browser-dialog-sources"

type GlobalConfig = RecursiveReadonly<Config> & RecursiveReadonly<RecursivePartial<Record<Sections, Config>>>

declare global {
    const $gc: GlobalConfig = {
        placeholders: { count: 4, effect: "glow" },
        umi: { placeholders: { count: 1 } },
        renderers: { placeholders: { count: 2 } },
        "browser-dialog-sources": { placeholders: { count: 6 } }
    }

    const globalConfig = $gc
}

export { }