import Vinyl from "vinyl";
import { Document, Element, Node, parseXml } from "libxmljs2";
import { Transform, TransformCallback } from "stream";

export interface SvgMergeOptions {
    path?: string;
    pathSeparator?: string;
    generateId?: (name: string, file?: any) => string;
    optimizations?: ((svg: Element) => void)[]
    formatting?: { omitXmlDeclaration?: boolean; pretty?: boolean; collapseEmpty?: boolean }
}

const defaults: SvgMergeOptions = {
    path: "result.svg",
    generateId: (name: string) => name,
    pathSeparator: "--",
    optimizations: [],
    formatting: {
        omitXmlDeclaration: true,
        pretty: false,
        collapseEmpty: true
    }
}

export default abstract class SvgMergeTransform<TOptions extends SvgMergeOptions> extends Transform {
    protected doc: Document;
    protected options: TOptions;

    constructor(options: TOptions) {
        super({ readableObjectMode: true, readableHighWaterMark: 16, writableObjectMode: true, writableHighWaterMark: 16 });
        this.options = { ...defaults, ...options };
        this.options.formatting = { ...defaults.formatting, ...(options.formatting ?? {}) };
        this.doc = new Document();
        this.doc.node("svg").defineNamespace("http://www.w3.org/2000/svg");
    }

    abstract get containerNodeName(): string;

    override _transform(chunk: any, _encoding: BufferEncoding, callback: TransformCallback): void {
        if (!(chunk instanceof Vinyl)) {
            callback(null, chunk);
        }

        const file = chunk as Vinyl;

        if (file.isNull()) {
            callback(null, file);
        } else if (file.isBuffer()) {
            this.append(file, this.doc);
            callback();
        } else if (file.isStream()) {
            this.emit("error", new Error("Streams are not supported."));
        }
    }

    override _flush(callback: TransformCallback): void {
        const { path, optimizations = [], formatting: { omitXmlDeclaration, collapseEmpty, pretty } = {} } = this.options;

        for (let i = 0; i < optimizations.length; i++) {
            optimizations[i](this.doc.root()!);
        }

        const output = new Vinyl({
            path,
            contents: Buffer.from((this.doc as any).toString({
                format: !!pretty,
                declaration: !omitXmlDeclaration,
                selfCloseEmpty: !!collapseEmpty,
                type: "xml",
                encoding: "UTF-8"
            }))
        });
        this.push(output);
        callback();
    }

    protected append(file: Vinyl, doc: Document): void {
        const id = this.id(file);
        const source = parseXml((file.contents as Buffer).toString(), { noblanks: true }).root()!;
        const container = doc.root()!.node(this.containerNodeName);

        container.attr({ id });
        const viewBox = source.attr("viewBox");
        if (viewBox) {
            container.attr("viewBox", viewBox.value());
        }
        else {
            const width = source.attr("width");
            const height = source.attr("height");
            if (width && height) {
                container.attr({ viewBox: `0 0 ${width} ${height}` });
            }
        }

        this.copyChildNodes(source, container);
    }

    protected id(file: Vinyl): string {
        const { generateId = n => n, pathSeparator: separator = "--" } = this.options;
        const path = file.relative;
        const ext = file.extname;
        return generateId(path.substring(0, path.length - ext.length), file)
            .replaceAll("/", separator)
            .replaceAll("\\", separator)
            .replaceAll(" ", "_");
    }

    protected copyChildNodes(src: Element, dst: Element) {
        const nodes = src.childNodes();

        for (let index = 0; index < nodes.length; index++) {
            const node = nodes[index];
            if (node.type() !== "element") {
                continue;
            }

            const stack: [Element, Element][] = [[node as Element, dst]];

            while (stack.length > 0) {
                const [current, target] = stack.shift()!;
                const clone = target.node(current.name());

                const attrs = current.attrs();
                for (let i = 0; i < attrs.length; i++) {
                    const attr = attrs[i];
                    clone.attr(attr.name(), attr.value());
                }

                const children = current.childNodes();
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child.type() === "element") {
                        stack.push([child as Element, clone]);
                    }
                }
            }
        }
    }
}