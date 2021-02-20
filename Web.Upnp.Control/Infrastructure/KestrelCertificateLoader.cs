using System;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;

namespace Web.Upnp.Control.Infrastructure
{
    public static class KestrelCertificateLoader
    {
        private const string EndpointsSectionName = "Kestrel:Endpoints";
        private const string CertificatesSectionName = "Kestrel:Certificates";
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
            foreach(var endpoint in configuration.GetSection(EndpointsSectionName).GetChildren())
            {
                var url = endpoint[UrlKey];

                if(string.IsNullOrEmpty(url) || !url.StartsWith("https://", StringComparison.InvariantCultureIgnoreCase)) continue;

                var certSection = endpoint.GetSection(CertificateSectionName);

                if(!certSection.Exists())
                {
                    certSection = configuration.GetSection($"{CertificatesSectionName}:Default");
                }

                if(certSection.Exists())
                {
                    return LoadFromConfiguration(certSection, contentRootFileProvider);
                }
            }

            return null;
        }

        private static X509Certificate2 LoadFromConfiguration(IConfigurationSection section, IFileProvider contentRootFileProvider)
        {
            var path = section[PathKey];
            if(!string.IsNullOrEmpty(path))
            {
                return CertificateLoader.LoadFromFile(contentRootFileProvider.GetFileInfo(path), section[PasswordKey]);
            }

            var subject = section[SubjectKey];
            if(!string.IsNullOrEmpty(subject))
            {
                return CertificateLoader.LoadFromStore(section[StoreKey] ?? "My",
                    section[LocationKey] ?? "CurrentUser", subject,
                    section.GetValue<bool?>(AllowInvalidKey) ?? false);
            }

            return null;
        }
    }
}