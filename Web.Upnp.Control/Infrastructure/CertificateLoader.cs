using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.FileProviders;
using static Microsoft.AspNetCore.Server.Kestrel.Https.CertificateLoader;

namespace Web.Upnp.Control.Infrastructure
{
    public static class CertificateLoader
    {
        public static X509Certificate2 LoadFromFile(string path, string password)
        {
            return File.Exists(path)
                ? new X509Certificate2(path, password)
                : throw new InvalidOperationException("File doesn't exist at requested path");
        }

        public static X509Certificate2 LoadFromFile(IFileInfo fileInfo, string password)
        {
            ArgumentNullException.ThrowIfNull(fileInfo);

            return fileInfo.Exists
                ? new X509Certificate2(fileInfo.PhysicalPath, password)
                : throw new InvalidOperationException("File doesn't exist at requested path");
        }

        public static X509Certificate2 LoadFromStore(string storeName, string storeLocation, string subject, bool allowInvalid)
        {
            return LoadFromStoreCert(subject, storeName, Enum.Parse<StoreLocation>(storeLocation), allowInvalid);
        }
    }
}