namespace Upnp.Control.Services;

public interface IBase64UrlDecoder
{
    byte[] Decode(string input);
}