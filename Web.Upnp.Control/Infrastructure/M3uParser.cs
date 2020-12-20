using System;
using System.Buffers;
using System.Buffers.Text;
using System.Collections.Generic;
using System.IO.Pipelines;
using System.Text;
using static System.Text.Encoding;

namespace Web.Upnp.Control.Infrastructure
{
    public class M3uParser : ByteSequenceParser<(string Path, string Info, int Duration)>
    {
        private static byte[] NewLine = new byte[] { 0x0d, 0x0a };
        private static byte[] EXTINF = new byte[] { 0x45, 0x58, 0x54, 0x49, 0x4E, 0x46, 0x3A };

        public M3uParser(PipeReader reader) : base(reader)
        {
        }

        protected override IEnumerable<ParseResult> Parse(ReadOnlySequence<byte> buffer)
        {
            var consumed = 0L;
            while(consumed < buffer.Length && TryReadTrack(buffer.Slice(consumed), out var line, out long c))
            {
                consumed += c;
                if(line.Path is null) continue;
                yield return new ParseResult(c, line, false);
            }
        }

        private bool TryReadTrack(ReadOnlySequence<byte> buffer, out (string Path, string Info, int Duration) track, out long consumed)
        {
            consumed = 0;
            track = default;

            var lineReader = new SequenceReader<byte>(buffer);

            while(lineReader.TryReadToAny(out ReadOnlySequence<byte> line, NewLine))
            {
                lineReader.AdvancePastAny(0x0d, 0x0a);

                if(line.Length == 0) continue;

                var reader = new SequenceReader<byte>(line);
                if(reader.IsNext(0x23, true)) // starts with '#'
                {
                    if(!reader.IsNext(EXTINF, true)) continue;
                    reader.AdvancePast(0x20);
                    if(!(reader.TryReadTo(out ReadOnlySpan<byte> span, 0x2C) && Utf8Parser.TryParse(span, out int duration, out _))) continue;
                    if(!lineReader.TryReadToAny(out line, NewLine)) break;
                    lineReader.AdvancePastAny(0x0d, 0x0a);
                    track = (UTF8.GetString(line), UTF8.GetString(reader.UnreadSequence), duration);
                }
                else
                {
                    track = (UTF8.GetString(line), null, -1);
                }

                consumed = lineReader.Consumed;
                return true;
            }

            return false;
        }
    }
}