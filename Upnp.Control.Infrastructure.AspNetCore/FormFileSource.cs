using Upnp.Control.Models;

namespace Upnp.Control.Infrastructure.AspNetCore;

public sealed class FormFileSource : FileSource
{
    private readonly IFormFile formFile;

    public FormFileSource(IFormFile formFile)
    {
        ArgumentNullException.ThrowIfNull(formFile);

        this.formFile = formFile;
    }

    public override string FileName => formFile.FileName;

    public override Stream GetStream() => formFile.OpenReadStream();
}