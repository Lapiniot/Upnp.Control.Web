import { RollupOptions, rollup } from "rollup"
import { Plugin } from "vite"
import crypto from "node:crypto";

type Partial2<T> = {
    [P in keyof T]?:
    T[P] extends {} ? Partial<T[P]> :
    T[P];
};

type GenerateServiceWorkerOptions = {
    swFileName: string,
    rollupOptions: RollupOptions,
    precache: {
        filter(assetName: string): boolean,
        manifestPlaceholder: string,
        manifestExtraFiles: string[]
    }
}

const defaults: GenerateServiceWorkerOptions = {
    swFileName: "service-worker.js",
    rollupOptions: {
        input: {
            "service-worker": "./src/service-worker.js"
        }
    },
    precache: {
        filter: (name) => name !== "service-worker.js",
        manifestPlaceholder: "self.__WB_MANIFEST",
        manifestExtraFiles: []
    }
}

export default function generateSW(options: Partial2<GenerateServiceWorkerOptions> = {}): Plugin {
    const { swFileName, rollupOptions, precache: { filter, manifestExtraFiles, manifestPlaceholder } } =
        { ...defaults, ...options, precache: { ...defaults.precache, ...options.precache } };
    return {
        name: "vite-plugin-generate-service-worker",
        async generateBundle(_, bundle) {
            const names = Object.getOwnPropertyNames(bundle).concat(manifestExtraFiles).filter(filter);
            const build = await rollup(rollupOptions);
            const { output: [{ code }] } = await build.generate({});
            this.emitFile({
                type: "asset", name: "service-worker", fileName: swFileName,
                source: code
                    .replaceAll(manifestPlaceholder, JSON.stringify(names))
                    .replaceAll("self.__BUILD_HASH", `\"${getRandomHash()}\"`)
            })
        }
    }
}

function getRandomHash(size: number = 5) {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16)).join("");
}