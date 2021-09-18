using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models.Converters;

public sealed class ResourceJsonConverter : JsonConverter<Resource>
{
    public override Resource Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotSupportedException();
    }

    public override void Write(Utf8JsonWriter writer, Resource value, JsonSerializerOptions options)
    {
        if(writer is null) throw new ArgumentNullException(nameof(writer));
        if(options is null) throw new ArgumentNullException(nameof(options));

        if(value is null)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStartObject();

        writer.WriteString("url", value.Url);
        writer.WriteString("proto", value.Protocol);
        if(value.Size is { } size) writer.WriteNumber("size", size);
        if(value.Duration is { } duration)
        {
            writer.WriteString("duration", duration.ToString(
                duration.Days == 0 ? duration.Hours == 0 ? @"mm\:ss" : @"hh\:mm\:ss" : @"d\.hh\:mm\:ss",
                CultureInfo.InvariantCulture));
        }
        if(value.Bitrate is { } bitrate) writer.WriteNumber("bitrate", bitrate);
        if(value.SampleFrequency is { } sampleFrequency) writer.WriteNumber("freq", sampleFrequency);
        if(value.BitsPerSample is { } bitsPerSample) writer.WriteNumber("bits", bitsPerSample);
        if(value.NrAudioChannels is { } nrAudioChannels) writer.WriteNumber("channels", nrAudioChannels);
        if(value.ColorDepth is { } colorDepth) writer.WriteNumber("depth", colorDepth);
        if(value.Resolution is { } resolution) writer.WriteString("resolution", resolution);
        if(value.ContentInfoUrl is { } contentInfoUri) writer.WriteString("infoUri", contentInfoUri);
        if(value.Protection is { } protection) writer.WriteString("protection", protection);

        if(value.Attributes is { Count: > 0 })
        {
            foreach(var (k, v) in value.Attributes) writer.WriteString(k, v);
        }

        writer.WriteEndObject();
    }
}