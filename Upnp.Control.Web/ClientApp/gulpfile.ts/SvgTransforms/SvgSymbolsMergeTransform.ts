import SvgMergeTransform, { SvgMergeOptions } from "./SvgMergeTransform";

export type SvgSymbolsMergeOptions = SvgMergeOptions

export default class SvgSymbolsMergeTransform extends SvgMergeTransform<SvgSymbolsMergeOptions> {
    constructor(options: SvgSymbolsMergeOptions) {
        super({ path: "symbols.svg", ...(options ?? {}) });
    }

    get containerNodeName(): string {
        return "symbol";
    }
}