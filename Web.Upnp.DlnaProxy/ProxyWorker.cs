using System;
using System.Buffers;
using System.Collections.Generic;
using System.Net;
using System.Net.Connections;
using System.Net.Http;
using System.Net.Listeners;
using System.Net.Pipelines;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Web.Upnp.DlnaProxy
{
    public class ProxyWorker : BackgroundService
    {
        private const int MaxBufferSize = 16 * 1024;
        private readonly ILogger<ProxyWorker> logger;

        public ProxyWorker(ILogger<ProxyWorker> logger)
        {
            this.logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var listener = new TcpSocketListener(new IPEndPoint(IPAddress.Any, 8888));

            await foreach(var connection in listener.ConfigureAwait(false).WithCancellation(stoppingToken))
            {
                logger.LogInformation($"Accepted new connection: {connection}");
                _ = ProcessRequestAsync(connection, stoppingToken);
            }
        }

        private async Task ProcessRequestAsync(INetworkConnection connection, CancellationToken stoppingToken)
        {
            await using(connection)
            {
                await using var requestReader = new NetworkPipeReader(connection);
                await using var requestProcessor = new HttpHeadersConsumer(requestReader);
                await requestProcessor.ReadHeadersAsync(stoppingToken).ConfigureAwait(false);


                using var requestMessage = new HttpRequestMessage(new HttpMethod(requestProcessor.Method), requestProcessor.RequestUri.PathAndQuery.TrimStart('/'));
                foreach(var (header, values) in requestProcessor.Headers)
                {
                    if(string.Equals(header, "Host", StringComparison.InvariantCultureIgnoreCase)) continue;
                    requestMessage.Headers.TryAddWithoutValidation(header, (IEnumerable<string>)values);
                }

                var sb1 = new StringBuilder();
                foreach(var (header, values) in requestMessage.Headers)
                {
                    sb1.Append(header);
                    sb1.Append(": ");
                    sb1.AppendLine(string.Join(' ', values));
                }

                logger.LogInformation($"Request headers:{Environment.NewLine}{sb1.ToString()}");

                using var client = new HttpClient();
                using var responseMessage = await client.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead, stoppingToken).ConfigureAwait(false);
                var headers = responseMessage.Headers;
                var sb = new StringBuilder("HTTP/1.1 ");
                sb.Append((int)responseMessage.StatusCode);
                sb.Append(' ');
                sb.AppendLine(responseMessage.ReasonPhrase);

                AppendHeader(sb, "Pragma", "no-cache");
                AppendHeader(sb, "Cache-Control", "no-cache");
                AppendHeader(sb, "Date", responseMessage.Headers.Date.Value.ToString());
                AppendHeader(sb, "Server", "eXtensible UPnP agent");
                AppendHeader(sb, "Connection", "close");
                AppendHeader(sb, "EXT", "");
                AppendHeader(sb, "TransferMode.DLNA.ORG", "Streaming");
                AppendHeader(sb, "ContentFeatures.DLNA.ORG", "*");
                AppendHeader(sb, "Accept-Ranges", "none");
                AppendHeader(sb, "Content-Type", "audio/x-aac");
                /*foreach(var (header, values) in responseMessage.Headers)
                {
                    //if(header.StartsWith("icy-", StringComparison.InvariantCultureIgnoreCase)) continue;
                    AppendHeader(sb, header, values);
                }

                foreach(var (header, values) in responseMessage.Content.Headers)
                {
                    foreach(var value in values)
                    {
                        sb.Append(header);
                        sb.Append(": ");
                        sb.AppendLine(value);
                    }
                }*/

                sb.AppendLine();

                logger.LogInformation($"Response headers:{Environment.NewLine}{sb.ToString()}");

                byte[] headerBuffer = Encoding.ASCII.GetBytes(sb.ToString());
                var sent = await connection.SendAsync(headerBuffer, stoppingToken).ConfigureAwait(false);

                await using var source = await responseMessage.Content.ReadAsStreamAsync(stoppingToken).ConfigureAwait(false);

                var socket = (connection as TcpSocketServerConnection).Socket;
                socket.SendTimeout = 5000;
                socket.SendBufferSize = 4 * 1024;
                socket.Blocking=false;

                while(!stoppingToken.IsCancellationRequested)
                {
                    var buffer = ArrayPool<byte>.Shared.Rent(MaxBufferSize);
                    try
                    {
                        var available = 0;
                        while(available < MaxBufferSize)
                        {
                            var bytes = source.Read(buffer.AsSpan(available));
                            //var bytes = await source.ReadAsync(buffer.AsMemory(available), stoppingToken).ConfigureAwait(false);
                            available += bytes;
                            if(bytes == 0) break;
                        }

                        logger.LogInformation($"{available} bytes recieved from the source");

                        if(available == 0) break;

                        //await connection.SendAsync(buffer.AsMemory(0, available), stoppingToken).ConfigureAwait(false);
                        var bytesSent = socket.Send(buffer, 0, available, SocketFlags.None, out SocketError error);
                        logger.LogInformation($"{bytesSent} bytes sent to receiver, error = {error}");
                    }
                    finally
                    {
                        ArrayPool<byte>.Shared.Return(buffer);
                    }
                }
            }

            static void AppendHeader(StringBuilder sb, string header, string value)
            {
                sb.Append(header);
                sb.Append(": ");
                sb.AppendLine(value);
            }
        }
    }
}
