namespace Upnp.Control.Abstractions;

public interface IBase64UrlDecoder
{
    byte[] Decode(string input);
}