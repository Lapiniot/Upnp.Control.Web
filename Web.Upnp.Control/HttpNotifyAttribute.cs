using Microsoft.AspNetCore.Mvc.Routing;

namespace Web.Upnp.Control
{
    public class HttpNotifyAttribute : HttpMethodAttribute
    {
        public HttpNotifyAttribute(string template) : base(new[] {"NOTIFY"}, template) {}

        public HttpNotifyAttribute() : this("") {}
    }
}