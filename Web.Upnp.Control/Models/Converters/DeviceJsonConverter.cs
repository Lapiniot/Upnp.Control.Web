using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;
using Upnp.Control.Models;

namespace Web.Upnp.Control.Models.Converters;

public sealed class DeviceJsonConverter : JsonConverter<UpnpDevice>
{
    public override UpnpDevice Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write([NotNull] Utf8JsonWriter writer, UpnpDevice value, [NotNull] JsonSerializerOptions options)
    {
        if(value is null)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStartObject();
        writer.WriteString("udn", value.Udn);
        writer.WriteString("url", value.Location.AbsoluteUri);
        writer.WriteString("type", value.DeviceType);
        writer.WriteString("name", value.FriendlyName);
        writer.WriteString("maker", value.Manufacturer);
        if(value.ManufacturerUri is { AbsoluteUri: { } makerUrl }) writer.WriteString("makerUrl", makerUrl);
        writer.WriteString("description", value.Description);
        writer.WriteString("model", value.ModelName);
        if(value.ModelUri is { AbsoluteUri: { } modelUrl }) writer.WriteString("modelUrl", modelUrl);
        writer.WriteString("modelNumber", value.ModelNumber);
        if(value.PresentationUri is { AbsoluteUri: { } presentationUrl }) writer.WriteString("presentUrl", presentationUrl);

        var serviceConverter = (JsonConverter<Service>)options.GetConverter(typeof(Service));

        writer.WriteStartArray("services");
        foreach(var service in value.Services)
        {
            serviceConverter.Write(writer, service, options);
        }

        writer.WriteEndArray();

        var iconConverter = (JsonConverter<Icon>)options.GetConverter(typeof(Icon));

        writer.WriteStartArray("icons");
        foreach(var icon in value.Icons)
        {
            iconConverter.Write(writer, icon, options);
        }

        writer.WriteEndArray();

        writer.WriteEndObject();
    }
}