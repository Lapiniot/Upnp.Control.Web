using System.Text.Json;

namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

public class JsonOptions
{
    public JsonOptions()
    {
        SerializerOptions = new JsonSerializerOptions();
    }

    public JsonSerializerOptions SerializerOptions { get; }
}