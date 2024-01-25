using System.Net;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Hosting;

namespace Upnp.Control.Infrastructure.AspNetCore;

public class CertificateGenerateInitializer(IHostEnvironment environment, IConfiguration configuration) : IServiceInitializer
{
    public async Task InitializeAsync(CancellationToken cancellationToken)
    {
        var appName = environment.ApplicationName;
        var configPath = environment.GetAppConfigPath();
        var certPath = Path.Combine(configPath, $"{appName}.pfx");
        var genCert = configuration.GetValue<string>("GENERATE_SSL_CERTIFICATE") is { Length: > 0 } value && (
            int.TryParse(value, out var n) && n is > 0 ||
            bool.TryParse(value, out var b) && b is true);

        if (genCert && !File.Exists(certPath))
        {
            Directory.CreateDirectory(configPath);
            var commonName = configuration.GetValue<string>("SSL_CERTIFICATE_HOSTNAME") ?? Dns.GetHostName();
            using var cert = CertificateHelpers.CreateSelfSignedCertificate(commonName,
                notBefore: DateTimeOffset.UtcNow.AddDays(-1),
                notAfter: DateTimeOffset.UtcNow.AddDays(365));
            var bytes = cert.Export(X509ContentType.Pfx, "");
            await File.WriteAllBytesAsync(certPath, bytes, cancellationToken).ConfigureAwait(false);
        }
    }
}