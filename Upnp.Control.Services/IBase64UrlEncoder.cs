namespace Upnp.Control.Services;

public interface IBase64UrlEncoder
{
    string Encode(byte[] input);
}