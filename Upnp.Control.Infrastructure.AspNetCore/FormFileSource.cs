namespace Upnp.Control.Infrastructure.AspNetCore;

public class FormFileSource : Models.FileSource
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