using System.Buffers;
using System.Buffers.Text;
using System.IO.Pipelines;
using System.Text;
using OOs.Memory;

namespace Upnp.Control.Services.Commands;

public readonly record struct M3UTrack(string Path, string Info, int Duration);

public class M3UTrackReader : IAsyncEnumerable<M3UTrack>
{
    private static readonly byte[] EXTINF = [0x45, 0x58, 0x54, 0x49, 0x4E, 0x46, 0x3A];
    private readonly PipeReader reader;
    private readonly Encoding encoding;

    public M3UTrackReader(PipeReader reader, Encoding encoding = null)
    {
        ArgumentNullException.ThrowIfNull(reader);
        this.reader = reader;
        this.encoding = encoding ?? Encoding.UTF8;
    }

    public async IAsyncEnumerator<M3UTrack> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            long total = 0;
            ReadResult result;

            try
            {
                result = await reader.ReadAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                yield break;
            }

            var buffer = result.Buffer;
            var isFinalBlock = result.IsCanceled | result.IsCompleted;

            while (total < buffer.Length && TryReadTrack(buffer.Slice(total), isFinalBlock, out var track, out var consumed))
            {
                if (track.Path is not null)
                {
                    yield return track;
                }

                total += consumed;
            }

            reader.AdvanceTo(buffer.GetPosition(total), buffer.End);

            if (isFinalBlock)
            {
                yield break;
            }
        }
    }

    private bool TryReadTrack(in ReadOnlySequence<byte> buffer, bool isFinalBlock, out M3UTrack track, out long consumed)
    {
        consumed = 0;
        track = default;

        var lineReader = new SequenceReader<byte>(buffer);

        while (lineReader.TryReadLine(out var line, !isFinalBlock))
        {
            if (line.Length == 0) continue;

            var r = new SequenceReader<byte>(line);
            if (r.IsNext(0x23, true)) // starts with '#'
            {
                if (!r.IsNext(EXTINF, true)) continue;
                r.AdvancePast(0x20);
                if (!(r.TryReadTo(out ReadOnlySpan<byte> span, 0x2C) && Utf8Parser.TryParse(span, out int duration, out _))) continue;
                r.AdvancePast(0x20);
                if (!lineReader.TryReadLine(out line, !isFinalBlock)) break;
                track = new(encoding.GetString(line), encoding.GetString(r.UnreadSequence), duration);
            }
            else
            {
                track = new(encoding.GetString(line), null, -1);
            }

            consumed = lineReader.Consumed;
            return true;
        }

        return false;
    }
}