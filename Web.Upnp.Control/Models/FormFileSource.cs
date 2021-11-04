using Upnp.Control.Models;

namespace Web.Upnp.Control.Models;

public class FormFileSource : IFileSource
{
    private readonly IFormFile formFile;

    public FormFileSource(IFormFile formFile)
    {
        ArgumentNullException.ThrowIfNull(formFile);

        this.formFile = formFile;
    }

    public string FileName => formFile.FileName;

    public Stream GetStream()
    {
        return formFile.OpenReadStream();
    }
}