using System;

namespace Web.Upnp.Control.Models
{
    public record Icon(int Width, int Height, Uri Url, string Mime)
    {
        private int id;
    }
}