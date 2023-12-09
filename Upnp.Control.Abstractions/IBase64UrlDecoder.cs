namespace Upnp.Control.Abstractions;

public interface IBase64UrlDecoder
{
    byte[] FromBase64String(string input);
}