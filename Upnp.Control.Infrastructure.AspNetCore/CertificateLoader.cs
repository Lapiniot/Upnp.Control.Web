using System.Security.Cryptography.X509Certificates;
using static Microsoft.AspNetCore.Server.Kestrel.Https.CertificateLoader;

namespace Upnp.Control.Infrastructure.AspNetCore;

internal static class CertificateLoader
{
    public static X509Certificate2 LoadFromFile(string path, string? password) =>
        File.Exists(path)
#if NET9_0_OR_GREATER
                ? X509CertificateLoader.LoadPkcs12FromFile(path, password)
#else
                ? new X509Certificate2(path, password)
#endif
            : throw new InvalidOperationException("File doesn't exist at requested path");

    public static X509Certificate2 LoadFromStore(string storeName, string storeLocation, string subject, bool allowInvalid) =>
        LoadFromStoreCert(subject, storeName, Enum.Parse<StoreLocation>(storeLocation), allowInvalid);
}