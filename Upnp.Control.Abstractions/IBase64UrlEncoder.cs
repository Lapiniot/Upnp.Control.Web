namespace Upnp.Control.Abstractions;

public interface IBase64UrlEncoder
{
    string ToBase64String(byte[] input);
    int GetMaxEncodedToUtf8Length(int length);
    void EncodeToUtf8(Span<byte> bytes, Span<byte> utf8, out int bytesWritten);
}