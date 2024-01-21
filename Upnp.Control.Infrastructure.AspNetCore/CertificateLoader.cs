using System.Security.Cryptography.X509Certificates;

using static Microsoft.AspNetCore.Server.Kestrel.Https.CertificateLoader;

namespace Upnp.Control.Infrastructure.AspNetCore;

internal static class CertificateLoader
{
    public static X509Certificate2 LoadFromFile(string path, string? password) =>
        File.Exists(path)
            ? new X509Certificate2(path, password)
            : throw new InvalidOperationException("File doesn't exist at requested path");

    public static X509Certificate2 LoadFromStore(string storeName, string storeLocation, string subject, bool allowInvalid) =>
        LoadFromStoreCert(subject, storeName, Enum.Parse<StoreLocation>(storeLocation), allowInvalid);
}