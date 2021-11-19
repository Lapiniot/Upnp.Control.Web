using Microsoft.AspNetCore.WebUtilities;

namespace Upnp.Control.Infrastructure.AspNetCore;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes: instantiated by DI container
internal class Base64Encoders : IBase64UrlEncoder, IBase64UrlDecoder
{
    public byte[] Decode(string input)
    {
        return WebEncoders.Base64UrlDecode(input);
    }

    public string Encode(byte[] input)
    {
        return WebEncoders.Base64UrlEncode(input);
    }
}