using Microsoft.AspNetCore.Mvc.Routing;

namespace Web.Upnp.Control.Infrastructure.Routing
{
    public sealed class HttpNotifyAttribute : HttpMethodAttribute
    {
        public HttpNotifyAttribute(string template) : base(new[] { "NOTIFY" }, template) { }

        public HttpNotifyAttribute() : this("") { }
    }
}