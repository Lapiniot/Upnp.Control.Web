using System.Net;
using System.Net.NetworkInformation;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace Upnp.Control.Infrastructure.AspNetCore;

internal static class CertificateHelpers
{
    public static X509Certificate2 CreateSelfSignedCertificate(string commonName, DateTimeOffset notBefore, DateTimeOffset notAfter)
    {
        using var rsa = RSA.Create(4096);
        var request = CreateSelfSignedCertificateRequest(rsa, commonName);
        return request.CreateSelfSigned(notBefore, notAfter);
    }

    public static CertificateRequest CreateSelfSignedCertificateRequest(RSA key, string commonName)
    {
        var subjectName = BuildSubjectNameExtension(commonName, organization: $"UPNP Dashboard on {commonName}", organizationalUnit: "development");
        var subjectAlternateNames = BuildSubjectAlternateNamesExtension(commonName);

        var request = new CertificateRequest(subjectName, key, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
        request.CertificateExtensions.Add(new X509BasicConstraintsExtension(true, false, 0, true));
        request.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.NonRepudiation | X509KeyUsageFlags.DigitalSignature | X509KeyUsageFlags.KeyEncipherment, true));
        request.CertificateExtensions.Add(new X509EnhancedKeyUsageExtension([new Oid("1.3.6.1.5.5.7.3.1", "Server Authentication")], true)); // extendedKeyUsage = serverAuth
        request.CertificateExtensions.Add(subjectAlternateNames);

        var subjectKeyIdentifier = new X509SubjectKeyIdentifierExtension(request.PublicKey, false);
        request.CertificateExtensions.Add(subjectKeyIdentifier);
        request.CertificateExtensions.Add(X509AuthorityKeyIdentifierExtension.CreateFromSubjectKeyIdentifier(subjectKeyIdentifier));
        return request;
    }

    public static X500DistinguishedName BuildSubjectNameExtension(string commonName,
        string? organization = null, string? organizationalUnit = null,
        string? countryOrRegion = null, string? stateOrProvince = null,
        string? emailAddress = null)
    {
        var subjBuilder = new X500DistinguishedNameBuilder();
        subjBuilder.AddCommonName(commonName);

        if (!string.IsNullOrWhiteSpace(countryOrRegion))
            subjBuilder.AddCountryOrRegion(countryOrRegion);
        if (!string.IsNullOrWhiteSpace(stateOrProvince))
            subjBuilder.AddStateOrProvinceName(stateOrProvince);
        if (!string.IsNullOrEmpty(organization))
            subjBuilder.AddOrganizationName(organization);
        if (!string.IsNullOrWhiteSpace(organizationalUnit))
            subjBuilder.AddOrganizationalUnitName(organizationalUnit);
        if (!string.IsNullOrWhiteSpace(emailAddress))
            subjBuilder.AddEmailAddress(emailAddress);

        return subjBuilder.Build();
    }

    public static X509Extension BuildSubjectAlternateNamesExtension(string commonName, bool critical = false)
    {
        var sanBuilder = new SubjectAlternativeNameBuilder();
        sanBuilder.AddDnsName("localhost");
        sanBuilder.AddDnsName(commonName);
        sanBuilder.AddIpAddress(IPAddress.Loopback);
        sanBuilder.AddIpAddress(IPAddress.IPv6Loopback);
        var ifaces = NetworkInterface.GetAllNetworkInterfaces().GetActiveExternalInterfaces();
        foreach (var iface in ifaces)
        {
            foreach (var address in iface.GetIPProperties().UnicastAddresses)
            {
                sanBuilder.AddIpAddress(address.Address);
            }
        }

        return sanBuilder.Build(critical);
    }
}