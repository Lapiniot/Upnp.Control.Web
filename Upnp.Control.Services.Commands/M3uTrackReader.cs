using System.Buffers;
using System.Buffers.Text;
using System.IO.Pipelines;
using System.Text;

namespace Upnp.Control.Services.Commands;

public readonly record struct M3UTrack(string Path, string Info, int DurationSeconds);

public class M3UTrackReader : IAsyncEnumerable<M3UTrack>
{
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
            ReadResult result;

            try
            {
                result = await reader.ReadAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            if (result is { IsCanceled: true } or { Buffer.Length: 0 })
            {
                break;
            }

            var buffer = result.Buffer;
            var isFinalBlock = result.IsCompleted;

            while (TryReadTrack(ref buffer, strict: !isFinalBlock, out var track))
            {
                yield return track;
            }

            reader.AdvanceTo(consumed: buffer.Start, examined: buffer.End);

            if (isFinalBlock)
            {
                break;
            }
        }
    }

    private bool TryReadTrack(ref ReadOnlySequence<byte> sequence, bool strict, out M3UTrack track)
    {
        var sequenceReader = new SequenceReader<byte>(sequence);

        while (TryReadLine(ref sequenceReader, strict, out var line))
        {
            if (line.Length == 0)
            {
                continue;
            }

            var lineReader = new SequenceReader<byte>(line);

            if (lineReader.IsNext((byte)'#', true))
            {
                if (!lineReader.IsNext("EXTINF:"u8, true))
                {
                    continue;
                }

                lineReader.AdvancePast((byte)' ');
                if (!(lineReader.TryReadTo(out ReadOnlySpan<byte> span, (byte)',') &&
                    Utf8Parser.TryParse(span, out int duration, out _)))
                {
                    continue;
                }

                lineReader.AdvancePast((byte)' ');
                if (!TryReadLine(ref sequenceReader, strict, out line))
                {
                    break;
                }

                track = new(encoding.GetString(line), encoding.GetString(lineReader.UnreadSequence), duration);
            }
            else
            {
                track = new(encoding.GetString(line), null, -1);
            }

            sequence = sequence.Slice(sequenceReader.Consumed);
            return true;

        }

        track = default;
        return false;
    }

    private static bool TryReadLine(ref SequenceReader<byte> reader, bool strict, out ReadOnlySequence<byte> line)
    {
        if (reader.TryReadToAny(out line, delimiters: "\r\n"u8, advancePastDelimiter: true))
        {
            reader.AdvancePast((byte)'\n');
            return true;
        }

        if (!strict && reader.Remaining > 0)
        {
            line = reader.UnreadSequence;
            reader.AdvanceToEnd();
            return true;
        }

        return false;
    }
}