using System.Diagnostics.CodeAnalysis;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public class GetContentOptionsBox
{
    private readonly GetContentOptions value;

    private GetContentOptionsBox(GetContentOptions value) => this.value = value;

    public static ValueTask<GetContentOptionsBox> BindAsync([NotNull] HttpContext context)
    {
        var query = context.Request.Query;

        bool? withParents = query.TryGetValue("WithParents", out var value) && bool.TryParse(value[0], out var v) ? v : null;
        bool? withResourceProps = query.TryGetValue("WithResourceProps", out value) && bool.TryParse(value[0], out v) ? v : null;
        bool? withVendorProps = query.TryGetValue("WithVendorProps", out value) && bool.TryParse(value[0], out v) ? v : null;
        bool? withMetadata = query.TryGetValue("WithMetadata", out value) && bool.TryParse(value[0], out v) ? v : null;
        bool? withDevice = query.TryGetValue("WithDevice", out value) && bool.TryParse(value[0], out v) ? v : null;
        var take = query.TryGetValue("Take", out value) && uint.TryParse(value[0], out var i) ? i : 50;
        var skip = query.TryGetValue("Skip", out value) && uint.TryParse(value[0], out i) ? i : 0;

        var options = new GetContentOptions(withParents, withResourceProps, withVendorProps, withMetadata, withDevice, take, skip);
        return new ValueTask<GetContentOptionsBox>(new GetContentOptionsBox(options));
    }

    public static implicit operator GetContentOptions?(GetContentOptionsBox? box) => box?.value;

    public GetContentOptions ToGetContentOptions() => value;
}