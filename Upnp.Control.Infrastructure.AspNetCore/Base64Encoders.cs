using Microsoft.AspNetCore.WebUtilities;

namespace Upnp.Control.Infrastructure.AspNetCore;

internal sealed class Base64Encoders : IBase64UrlEncoder, IBase64UrlDecoder
{
    public byte[] Decode(string input) => WebEncoders.Base64UrlDecode(input);

    public string Encode(byte[] input) => WebEncoders.Base64UrlEncode(input);
}