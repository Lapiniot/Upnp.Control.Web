using System.Buffers;
using System.Buffers.Text;
using System.IO.Compression;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.FileProviders;
using static System.Text.Encoding;

namespace Upnp.Control.Infrastructure.AspNetCore;

public static class CertificateDownloadServices
{
    private const int ChunkSize = 48;

    public static IResult GetCertificatesArchive(IConfiguration configuration, IWebHostEnvironment environment, HttpRequest request) =>
        new PushZipStreamHttpResult($"{request.Host.Host}-certificates.zip",
            (archive, cancellationToken) => BuildChainArchiveAsync(archive, configuration, environment.ContentRootFileProvider, cancellationToken));

    private static async Task BuildChainArchiveAsync(ZipArchive archive, IConfiguration configuration, IFileProvider fileProvider, CancellationToken cancellationToken)
    {
        using var certificate = KestrelCertificateLoader.LoadFromConfiguration(configuration, fileProvider);
        using var chain = new X509Chain();
        chain.Build(certificate!);

        foreach (var chainElement in chain.ChainElements)
        {
            var cert = chainElement.Certificate;
            var entryName = cert.GetNameInfo(X509NameType.SimpleName, false);
            var bytes = cert.Export(X509ContentType.Cert);
            var entry = archive.CreateEntry(GetSafeFileName(entryName) + ".crt", CompressionLevel.Optimal);
            var stream = entry.Open();

            await using (stream.ConfigureAwait(false))
            {
                var buffer = ArrayPool<byte>.Shared.Rent(Base64.GetMaxEncodedToUtf8Length(bytes.Length) + 55 + bytes.Length / ChunkSize);
                try
                {
                    var size = PemEncode(bytes, buffer);
                    await stream.WriteAsync(buffer.AsMemory(0, size), cancellationToken).ConfigureAwait(false);
                }
                finally
                {
                    ArrayPool<byte>.Shared.Return(buffer);
                }

                await stream.FlushAsync(cancellationToken).ConfigureAwait(false);
            }
        }
    }

    private static string GetSafeFileName(string name)
    {
        return string.Create(name.Length, name, static (span, str) =>
        {
            for (var i = 0; i < span.Length; i++)
            {
                span[i] = str[i] switch
                {
                    ' ' or '\0' or ':' or '*' or '?' => '_',
                    var ch => ch
                };
            }
        });
    }

    private static int PemEncode(Span<byte> bytes, Span<byte> utf8)
    {
        var total = ASCII.GetBytes("-----BEGIN CERTIFICATE-----\n", utf8);
        for (var index = 0; index < bytes.Length; index += ChunkSize)
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
