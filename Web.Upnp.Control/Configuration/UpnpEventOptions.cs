using System;

namespace Web.Upnp.Control.Services.Configuration
{
    public record UpnpEventOptions
    {
        public TimeSpan SessionTimeout { get; init; } = TimeSpan.FromMinutes(15);
    }
}