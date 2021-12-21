using System.Buffers;
using System.Buffers.Text;
using System.IO.Pipelines;
using System.Memory;
using System.Text;

namespace Upnp.Control.Services.Commands;

public readonly record struct M3uTrack(string Path, string Info, int Duration);

public class M3uTrackReader : IAsyncEnumerable<M3uTrack>
{
    private static readonly byte[] EXTINF = new byte[] { 0x45, 0x58, 0x54, 0x49, 0x4E, 0x46, 0x3A };
    private readonly PipeReader reader;
    private readonly Encoding encoding;

    public M3uTrackReader(PipeReader reader, Encoding encoding = null)
    {
        ArgumentNullException.ThrowIfNull(reader);
        this.reader = reader;
        this.encoding = encoding ?? Encoding.UTF8;
    }

    public async IAsyncEnumerator<M3uTrack> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        while(!cancellationToken.IsCancellationRequested)
        {
            long total = 0;
            ReadResult result;

            try
            {
                var vt = reader.ReadAsync(cancellationToken);
                result = vt.IsCompletedSuccessfully ? vt.Result : await vt.ConfigureAwait(false);
            }
            catch(OperationCanceledException)
            {
                yield break;
            }

            var buffer = result.Buffer;
            var isFinalBlock = result.IsCanceled | result.IsCompleted;

            while(total < buffer.Length && TryReadTrack(buffer.Slice(total), isFinalBlock, out var track, out var consumed))
            {
                if(track.Path is not null)
                {
                    yield return track;
                }
                total += consumed;
            }

            reader.AdvanceTo(buffer.GetPosition(total), buffer.End);

            if(isFinalBlock)
            {
                yield break;
            }
        }
    }

    private bool TryReadTrack(in ReadOnlySequence<byte> buffer, bool isFinalBlock, out M3uTrack track, out long consumed)
    {
        consumed = 0;
        track = default;

        var lineReader = new SequenceReader<byte>(buffer);

        while(lineReader.TryReadLine(out ReadOnlySequence<byte> line, !isFinalBlock))
        {
            if(line.Length == 0) continue;

            var reader = new SequenceReader<byte>(line);
            if(reader.IsNext(0x23, true)) // starts with '#'
            {
                if(!reader.IsNext(EXTINF, true)) continue;
                reader.AdvancePast(0x20);
                if(!(reader.TryReadTo(out ReadOnlySpan<byte> span, 0x2C) && Utf8Parser.TryParse(span, out int duration, out _))) continue;
                reader.AdvancePast(0x20);
                if(!lineReader.TryReadLine(out line, !isFinalBlock)) break;
                track = new(encoding.GetString(line), encoding.GetString(reader.UnreadSequence), duration);
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