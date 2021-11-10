using System.Buffers.Text;
using System.Diagnostics.CodeAnalysis;
using System.Security.Cryptography.X509Certificates;

using static System.Text.Encoding;

namespace Upnp.Control.Infrastructure.AspNetCore.Middleware;

public sealed class CertificateDownloadMiddleware : IMiddleware
{
    private const int ChunkSize = 48;
    private readonly IWebHostEnvironment environment;
    private readonly IConfiguration configuration;
    private readonly IServer server;

    public CertificateDownloadMiddleware(IWebHostEnvironment environment, IConfiguration configuration, IServer server)
    {
        ArgumentNullException.ThrowIfNull(environment);
        ArgumentNullException.ThrowIfNull(configuration);
        ArgumentNullException.ThrowIfNull(server);

        this.environment = environment;
        this.configuration = configuration;
        this.server = server;
    }

    public async Task InvokeAsync([NotNull] HttpContext context, RequestDelegate next)
    {
        using var certificate = KestrelCertificateLoader.LoadFromConfiguration(configuration, environment.ContentRootFileProvider);

        if(certificate != null)
            await SendAsFileAsync(context.Response, certificate, $"{context.Request.Host.Host}.crt").ConfigureAwait(false);
        else
            context.Response.StatusCode = 404;

        await context.Response.CompleteAsync().ConfigureAwait(false);
    }

    private static async Task SendAsFileAsync(HttpResponse response, X509Certificate2 certificate, string fileName)
    {
        var bytes = certificate.Export(X509ContentType.Cert);

        response.ContentType = "application/octet-stream";
        response.Headers.Add("Content-Disposition", $"attachment; filename=\"{fileName}\"");

        var writer = response.BodyWriter;

        var memory = writer.GetMemory(Base64.GetMaxEncodedToUtf8Length(bytes.Length) + 55 + bytes.Length / ChunkSize);

        writer.Advance(PemEncode(bytes, memory.Span));

        await writer.FlushAsync().ConfigureAwait(false);
    }

    private static int PemEncode(Span<byte> bytes, Span<byte> utf8)
    {
        var total = ASCII.GetBytes("-----BEGIN CERTIFICATE-----\n", utf8);

        for(var index = 0; index < bytes.Length; index += ChunkSize)
        {
            var source = bytes.Length - index > ChunkSize
                ? bytes.Slice(index, ChunkSize)
                : bytes[index..];
            Base64.EncodeToUtf8(source, utf8[total..], out _, out var bytesWritten);
            total += bytesWritten;
            utf8[total++] = (byte)'\n';
        }

        total += ASCII.GetBytes("-----END CERTIFICATE-----\n", utf8[total..]);

        return total;
    }
}