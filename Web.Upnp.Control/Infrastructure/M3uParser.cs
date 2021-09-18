using System.Buffers;
using System.Buffers.Text;
using System.IO.Pipelines;
using System.Memory;
using System.Text;

namespace Web.Upnp.Control.Infrastructure;

public class M3uParser : ByteSequenceParser<(string Path, string Info, int Duration)>
{
    private static readonly byte[] EXTINF = new byte[] { 0x45, 0x58, 0x54, 0x49, 0x4E, 0x46, 0x3A };
    private readonly Encoding encoding;

    public M3uParser(PipeReader reader, Encoding encoding = null) : base(reader)
    {
        this.encoding = encoding ?? Encoding.UTF8;
    }

    protected override IEnumerable<ParseResult> Parse(ReadResult readResult)
    {
        var consumed = 0L;
        var buffer = readResult.Buffer;

        while(consumed < buffer.Length && TryReadTrack(buffer.Slice(consumed), readResult.IsCompleted || readResult.IsCanceled, out var line, out long c))
        {
            consumed += c;
            if(line.Path is null) continue;
            yield return new ParseResult(c, line, false);
        }
    }

    private bool TryReadTrack(ReadOnlySequence<byte> buffer, bool isCompleted, out (string Path, string Info, int Duration) track, out long consumed)
    {
        consumed = 0;
        track = default;

        var lineReader = new SequenceReader<byte>(buffer);

        while(lineReader.TryReadLine(out ReadOnlySequence<byte> line, !isCompleted))
        {
            if(line.Length == 0) continue;

            var reader = new SequenceReader<byte>(line);
            if(reader.IsNext(0x23, true)) // starts with '#'
            {
                if(!reader.IsNext(EXTINF, true)) continue;
                reader.AdvancePast(0x20);
                if(!(reader.TryReadTo(out ReadOnlySpan<byte> span, 0x2C) && Utf8Parser.TryParse(span, out int duration, out _))) continue;
                reader.AdvancePast(0x20);
                if(!lineReader.TryReadLine(out line, !isCompleted)) break;
                track = (encoding.GetString(line), encoding.GetString(reader.UnreadSequence), duration);
            }
            else
            {
                track = (encoding.GetString(line), null, -1);
            }

            consumed = lineReader.Consumed;
            return true;
        }

        return false;
    }
}