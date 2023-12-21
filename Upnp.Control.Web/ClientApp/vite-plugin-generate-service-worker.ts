import { Plugin, build as viteBuild, Rollup as R, InlineConfig } from "vite"
import crypto from "node:crypto";

interface GenerateSWConfig extends InlineConfig {
    filter?: (name: string) => boolean,
    manifestPlaceholder?: string,
    manifestExtraFiles?: string[]
}

const defaults: GenerateSWConfig = {
    build: {
        rollupOptions: {
            input: { "service-worker": "./src/service-worker.js" },
            output: { entryFileNames: () => "[name].js" },
        }
    },
    filter: (name: string) => name !== "service-worker.js",
    manifestPlaceholder: "self.__WB_MANIFEST",
    manifestExtraFiles: []
}

export default function generateSW(config: GenerateSWConfig): Plugin {
    const { manifestExtraFiles, filter, manifestPlaceholder, ...options } = {
        ...defaults, ...config, build: {
            ...defaults.build, ...config.build,
            rollupOptions: { ...defaults.build.rollupOptions, ...config.build.rollupOptions }
        }
    };
    return {
        name: "vite-plugin-generate-service-worker",
        enforce: "post",
        async generateBundle(_, bundle) {
            const names = Object.getOwnPropertyNames(bundle).concat(manifestExtraFiles).filter(filter);
            const { output } = await viteBuild({
                ...options,
                configFile: false,
                publicDir: false,
                build: {
                    ...options.build,
                    emptyOutDir: false,
                    copyPublicDir: false,
                    cssMinify: false,
                    write: false,
                    reportCompressedSize: false,
                    rollupOptions: {
                        ...options.build.rollupOptions,
                        plugins: [{
                            name: "vite-plugin-postprocess-service-worker",
                            generateBundle(_, bundle) {
                                for (const name in bundle) {
                                    const chunkOrAsset = bundle[name];
                                    if (isChunk(chunkOrAsset)) {
                                        chunkOrAsset.code = chunkOrAsset.code
                                            .replaceAll(manifestPlaceholder, JSON.stringify(names))
                                            .replaceAll("self.__BUILD_HASH", `\"${getRandomHash()}\"`)
                                    }
                                }
                            }
                        }]
                    }
                }
            }) as R.RollupOutput;

            // merge into the outer bundle
            for (const i in output) {
                const chunkOrAsset = output[i];
                if (isChunk(chunkOrAsset)) {
                    this.emitFile({ type: "prebuilt-chunk", code: chunkOrAsset.code, fileName: chunkOrAsset.fileName });
                } else {
                    this.emitFile({ type: "asset", fileName: chunkOrAsset.fileName, name: chunkOrAsset.name, source: chunkOrAsset.source });
                }
            }
        }
    }
}

function isChunk(item: R.OutputAsset | R.OutputChunk): item is R.OutputChunk {
    return item.type === "chunk";
}

function getRandomHash(size: number = 4) {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16)).join("");
}