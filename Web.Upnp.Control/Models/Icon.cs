using System;

namespace Web.Upnp.Control.Models
{
    public record Icon(int Id, int Width, int Height, Uri Url, string Mime);
}