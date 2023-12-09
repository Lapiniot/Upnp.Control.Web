
using System.Buffers.Text;

namespace Upnp.Control.Infrastructure.AspNetCore;

internal sealed class Base64UrlConvert : IBase64UrlEncoder, IBase64UrlDecoder
{
    public byte[] FromBase64String(string input) => Base64UrlSafe.FromBase64String(input);

    public string ToBase64String(byte[] input) => Base64UrlSafe.ToBase64String(input);

    public void EncodeToUtf8(Span<byte> bytes, Span<byte> utf8, out int bytesWritten) =>
        Base64UrlSafe.EncodeToUtf8(bytes, utf8, out _, out bytesWritten);

    public int GetMaxEncodedToUtf8Length(int length) => Base64.GetMaxEncodedToUtf8Length(length);
}