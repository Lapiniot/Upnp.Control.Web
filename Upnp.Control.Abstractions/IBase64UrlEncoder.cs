namespace Upnp.Control.Abstractions;

public interface IBase64UrlEncoder
{
    string Encode(byte[] input);
}