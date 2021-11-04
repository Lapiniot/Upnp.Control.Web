namespace Upnp.Control.Models;

public interface IFileSource
{
    string FileName { get; }
    Stream GetStream();
}