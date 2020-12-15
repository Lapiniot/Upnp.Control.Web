using System;
using System.Buffers;
using System.Collections.Generic;
using System.IO;
using System.Net.Pipelines;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Primitives;
using static System.Text.Encoding;

namespace Web.Upnp.DlnaProxy
{
    internal class HttpHeadersConsumer : PipeConsumer
    {
        private string method;
        private Version version;
        private string url;
        private Uri requestUri;
        private readonly Dictionary<string, StringValues> headers;
        private readonly NetworkPipeReader reader;
        RequestProcessorState state;

        public HttpHeadersConsumer(NetworkPipeReader reader) : base(reader)
        {
            this.reader = reader;
            headers = new Dictionary<string, StringValues>(StringComparer.InvariantCultureIgnoreCase);
        }

        public string Method
        {
            get => state is ReadHeadersState || state is TerminateState
                ? method
                : throw new InvalidOperationException("Invalid state. HTTP method is not available yet.");
            private set => method = value;
        }

        public Version Version
        {
            get => state is ReadHeadersState || state is TerminateState
                ? version
                : throw new InvalidOperationException("Invalid state. HTTP version is not available yet.");
            private set => version = value;
        }

        public Uri RequestUri
        {
            get => state is TerminateState
                ? requestUri
                : throw new InvalidOperationException("Invalid state. Full request uri is not available yet.");
            private set => requestUri = value;
        }

        public IReadOnlyDictionary<string, StringValues> Headers => state is TerminateState
            ? headers
            : throw new InvalidOperationException("Invalid state. HTTP headers are not available yet.");

        #region Implementation of PipeConsumer

        protected override bool Consume(in ReadOnlySequence<byte> buffer, out long consumed)
        {
            return state.Process(buffer, out consumed);
        }

        protected override void OnCompleted(Exception exception = null)
        {
        }

        #endregion

        #region Overrides of PipeConsumer

        protected override Task StartingAsync(CancellationToken cancellationToken)
        {
            if(state is not null)
            {
                throw new InvalidOperationException("Cannot start in this state. Allready running.");
            }

            state = new ReadStartLineState(this);

            return base.StartingAsync(cancellationToken);
        }

        #endregion

        public async Task ReadHeadersAsync(CancellationToken stoppingToken)
        {
            try
            {
                await StartActivityAsync(stoppingToken).ConfigureAwait(false);
                reader.Start();
                await Completion.ConfigureAwait(false);
            }
            finally
            {
                await reader.StopAsync().ConfigureAwait(false);
            }
        }

        private abstract class RequestProcessorState
        {
            private readonly HttpHeadersConsumer requestProcessor;
            protected static byte[] NewLine = new byte[] { 0x0d, 0x0a };

            protected RequestProcessorState(HttpHeadersConsumer requestProcessor)
            {
                this.requestProcessor = requestProcessor ?? throw new ArgumentNullException(nameof(requestProcessor));
            }

            internal abstract bool Process(ReadOnlySequence<byte> buffer, out long consumed);

            protected void NextState(RequestProcessorState newState)
            {
                requestProcessor.state = newState;
            }
        }

        private class ReadStartLineState : RequestProcessorState
        {
            private readonly HttpHeadersConsumer requestProcessor;

            public ReadStartLineState(HttpHeadersConsumer requestProcessor) : base(requestProcessor)
            {
                this.requestProcessor = requestProcessor;
            }

            internal override bool Process(ReadOnlySequence<byte> buffer, out long consumed)
            {
                var lineReader = new SequenceReader<byte>(buffer);

                if(!lineReader.TryReadTo(out ReadOnlySequence<byte> line, NewLine))
                {
                    consumed = 0;
                    return true;
                }

                var reader = new SequenceReader<byte>(line);

                if(reader.TryReadTo(out ReadOnlySequence<byte> sequence, 0x20) && sequence.Length > 0)
                {
                    requestProcessor.Method = ASCII.GetString(sequence);

                    if(reader.TryReadTo(out sequence, 0x20) && sequence.Length > 0)
                    {
                        requestProcessor.url = ASCII.GetString(sequence);

                        if(reader.TryReadLittleEndian(out int http) && http == 0x50545448 && reader.IsNext(0x2F, true) &&
                            reader.TryRead(out var major) && reader.IsNext(0x2E, true) && reader.TryRead(out var minor))
                        {
                            requestProcessor.Version = new Version(major - 0x30, minor - 0x30);
                            NextState(new ReadHeadersState(requestProcessor));
                            consumed = lineReader.Consumed;
                            return true;
                        }
                    }
                }

                throw new InvalidDataException("Invalid HTTP message start line");
            }
        }

        private class ReadHeadersState : RequestProcessorState
        {
            private readonly HttpHeadersConsumer requestProcessor;

            public ReadHeadersState(HttpHeadersConsumer requestProcessor) : base(requestProcessor)
            {
                this.requestProcessor = requestProcessor;
            }

            internal override bool Process(ReadOnlySequence<byte> buffer, out long consumed)
            {
                var lineReader = new SequenceReader<byte>(buffer);

                ReadOnlySpan<byte> delimiter = NewLine;

                var headers = requestProcessor.headers;

                while(lineReader.TryReadTo(out ReadOnlySequence<byte> line, delimiter))
                {
                    if(line.Length == 0)
                    {
                        requestProcessor.RequestUri = new Uri($"http://{headers["Host"]}{requestProcessor.url}");
                        NextState(new TerminateState(requestProcessor));
                        consumed = lineReader.Consumed;
                        return false;
                    }

                    var reader = new SequenceReader<byte>(line);

                    if(reader.TryReadTo(out ReadOnlySequence<byte> sequence, 0x3a))
                    {
                        reader.AdvancePast(0x20);

                        var header = ASCII.GetString(sequence);
                        var value = ASCII.GetString(reader.UnreadSequence);

                        if(headers.TryGetValue(header, out var values))
                        {
                            headers[header] = StringValues.Concat(values, value);
                        }
                        else
                        {
                            headers.Add(header, value);
                        }
                    }
                }

                consumed = lineReader.Consumed;
                return true;
            }
        }

        private class TerminateState : RequestProcessorState
        {
            public TerminateState(HttpHeadersConsumer requestProcessor) : base(requestProcessor)
            {
            }

            internal override bool Process(ReadOnlySequence<byte> buffer, out long consumed)
            {
                consumed = 0;
                return false;
            }
        }
    }
}