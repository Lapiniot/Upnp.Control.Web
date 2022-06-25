import SvgMergeTransform, { SvgMergeOptions } from "./SvgMergeTransform";

export type SvgSymbolsMergeOptions = SvgMergeOptions

export default class SvgSymbolsMergeTransform extends SvgMergeTransform<SvgSymbolsMergeOptions> {
    constructor(options: SvgSymbolsMergeOptions) {
        super({ path: "symbols.svg", ...(options ?? {}) });
        this.doc.root()!.attr({ style: "display:none", width: "0", height: "0" });
    }

    get containerNodeName(): string {
        return "symbol";
    }
}