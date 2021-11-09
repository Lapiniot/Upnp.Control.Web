using Microsoft.AspNetCore.Mvc.Routing;

namespace Upnp.Control.Infrastructure.AspNetCore.Routing;

public sealed class HttpNotifyAttribute : HttpMethodAttribute
{
    public HttpNotifyAttribute(string template) : base(new[] { "NOTIFY" }, template) { }

    public HttpNotifyAttribute() : this("") { }
}