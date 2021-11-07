using Upnp.Control.Models;

namespace Web.Upnp.Control.Models;

public class FormFileSource : FileSource
{
    private readonly IFormFile formFile;

    public FormFileSource(IFormFile formFile)
    {
        ArgumentNullException.ThrowIfNull(formFile);

        this.formFile = formFile;
    }

    public override string FileName => formFile.FileName;

    public override Stream GetStream()
    {
        return formFile.OpenReadStream();
    }
}