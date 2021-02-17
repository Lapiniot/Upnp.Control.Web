/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

interface PrecacheEntry {
    integrity?: string;
    url: string;
    revision?: string;
}

declare global {
    export interface WorkerGlobalScope {
        __WB_MANIFEST: Array<PrecacheEntry | string>;
    }
}

declare const self: ServiceWorkerGlobalScope;

const entries = self.__WB_MANIFEST;

export { }