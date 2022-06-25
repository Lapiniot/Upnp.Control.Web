import Vinyl from "vinyl";
import { Document as XmlDocument, parseXml } from "libxmljs2";
import SvgMergeTransform, { SvgMergeOptions } from "./SvgMergeTransform";

export type SvgSymbolsMergeOptions = SvgMergeOptions;

export default class SvgSymbolsMergeTransform extends SvgMergeTransform<SvgSymbolsMergeOptions> {

    constructor(options: SvgSymbolsMergeOptions) {
        super({ path: "symbols.svg", ...(options ?? {}) });
    }

    protected append(file: Vinyl, doc: XmlDocument): void {
        const xml = parseXml((file.contents as Buffer).toString(), { noblanks: true });
        const svg = xml.root();
        if (!svg)
            return;

        const symbol = doc.root()!.node("symbol");
        symbol.attr({ id: this.id(file) });
        const viewBox = svg.attr("viewBox");
        if (viewBox) {
            symbol.attr("viewBox", viewBox.value());
        }
        else {
            const width = svg.attr("width");
            const height = svg.attr("height");
            if (width && height) {
                symbol.attr({ viewBox: `0 0 ${width} ${height}` });
            }
        }

        this.copyContent(svg, symbol);
    }
}