using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.FileProviders;
using static Microsoft.AspNetCore.Server.Kestrel.Https.CertificateLoader;

namespace Web.Upnp.Control.Infrastructure
{
    public static class CertificateLoader
    {
        public static X509Certificate2 LoadFromFile(string path, string password)
        {
            if(!File.Exists(path)) throw new InvalidOperationException("File doesn't exist at requested path");
            return new X509Certificate2(path, password);
        }

        public static X509Certificate2 LoadFromFile(IFileInfo fileInfo, string password)
        {
            if(!fileInfo.Exists) throw new InvalidOperationException("File doesn't exist at requested path");
            return new X509Certificate2(fileInfo.PhysicalPath, password);
        }

        public static X509Certificate2 LoadFromStore(string storeName, string storeLocation, string subject, bool allowInvalid)
        {
            return LoadFromStoreCert(subject, storeName, Enum.Parse<StoreLocation>(storeLocation), allowInvalid);
        }
    }
}