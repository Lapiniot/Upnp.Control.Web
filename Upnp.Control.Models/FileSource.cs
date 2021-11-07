namespace Upnp.Control.Models;

public abstract class FileSource
{
    public abstract string FileName { get; }
    public abstract Stream GetStream();
}