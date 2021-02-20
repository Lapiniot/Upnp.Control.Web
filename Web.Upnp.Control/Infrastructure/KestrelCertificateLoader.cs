using System;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;

namespace Web.Upnp.Control.Infrastructure
{
    public static class KestrelCertificateLoader
    {
        private const string EndpointsSectionName = "Kestrel:Endpoints";
        private const string CertificateSectionName = "Certificate";
        private const string UrlKey = "Url";
        private const string PathKey = "Path";
        private const string PasswordKey = "Password";
        private const string StoreKey = "Store";
        private const string LocationKey = "Location";
        private const string SubjectKey = "Subject";
        private const string AllowInvalidKey = "AllowInvalid";

        public static X509Certificate2 LoadFromConfiguration(IConfiguration configuration, IFileProvider contentRootFileProvider)
        {
            var endpointsSection = configuration.GetSection(EndpointsSectionName);

            foreach(var endpoint in endpointsSection.GetChildren())
            {
                var url = endpoint[UrlKey];

                if(string.IsNullOrEmpty(url) || !url.StartsWith("https://", StringComparison.InvariantCultureIgnoreCase)) continue;

                var certSection = endpoint.GetSection(CertificateSectionName);

                if(certSection == null) continue;

                var path = certSection[PathKey];
                if(!string.IsNullOrEmpty(path))
                {
                    return CertificateLoader.LoadFromFile(contentRootFileProvider.GetFileInfo(path), certSection[PasswordKey]);
                }

                var subject = certSection[SubjectKey];
                if(!string.IsNullOrEmpty(subject))
                {
                    return CertificateLoader.LoadFromStore(certSection[StoreKey] ?? "My",
                        certSection[LocationKey] ?? "CurrentUser", subject,
                        certSection.GetValue<bool?>(AllowInvalidKey) ?? false);
                }
            }

            return null;
        }
    }
}