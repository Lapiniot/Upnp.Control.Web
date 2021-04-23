using namespace System.IO
using namespace System.Net
using namespace System.Text
using namespace System.Security.Cryptography
using namespace System.Security.Cryptography.X509Certificates

$parent = [Dns]::GetHostName().ToLowerInvariant()

$altnames = ("$parent", "www.$parent", "localhost")
$expires = [DateTime]::UtcNow.AddYears(1)

$ExtendedKeyUsageList = [OidCollection]::new()
$ExtendedKeyUsageList.Add("1.3.6.1.5.5.7.3.1")

$extensions = @(
    [X509BasicConstraintsExtension]::new($true, $false, 0, $true), # critical, CA:TRUE"
    [X509KeyUsageExtension]::new("NonRepudiation,KeyCertSign,CrlSign,DigitalSignature,KeyEncipherment", $true),
    [X509EnhancedKeyUsageExtension]::new($ExtendedKeyUsageList, $true), # critical, serverAuth
    [X509Extension]::new("1.3.6.1.4.1.311.84.1.1", [Encoding]::ASCII.GetBytes("02"), $false) # indicates .aspnet development compatible certificate
)

$cert = New-SelfSignedCertificate -Type Custom -DnsName $altnames -NotAfter $expires `
    -KeyAlgorithm RSA -KeyLength 4096 -HashAlgorithm SHA256 `
    -KeyUsageProperty All -KeyExportPolicy Exportable -Extension $extensions -Verbose

$cert | Select-Object *

$path = Get-Location

[File]::WriteAllText([Path]::Combine($path, "upnp-dashboard.crt"), `
    [StringBuilder]::new().`
        AppendLine("-----BEGIN CERTIFICATE-----").`
        AppendLine([Convert]::ToBase64String($cert.Export("Cert"), "InsertLineBreaks")).`
        AppendLine("-----END CERTIFICATE-----").`
        ToString())

[File]::WriteAllText([Path]::Combine($path, "upnp-dashboard.key"), `
    [StringBuilder]::new().`
        AppendLine("-----BEGIN PRIVATE KEY-----").`
        AppendLine([Convert]::ToBase64String($cert.PrivateKey.ExportPkcs8PrivateKey(), "InsertLineBreaks")).`
        AppendLine("-----END PRIVATE KEY-----").`
        ToString())

$password = $(Read-Host -AsSecureString -Prompt "Enter export password");

$cert | Export-PfxCertificate -FilePath $([Path]::Combine($path, "upnp-dashboard.pfx")) -Password $password -Force -Verbose