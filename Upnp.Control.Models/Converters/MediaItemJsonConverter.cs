using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

using static Upnp.Control.Models.Converters.DIDLWriterUtils;

namespace Upnp.Control.Models.Converters;

public sealed class MediaItemJsonConverter : JsonConverter<MediaItem>
{
    public override MediaItem Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotSupportedException();

    public override void Write([NotNull] Utf8JsonWriter writer, MediaItem value, [NotNull] JsonSerializerOptions options)
    {
        if (value is null)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStartObject();
        WriteCoreProps(writer, value);
        if (value.Creator != null) writer.WriteString("creator", value.Creator);
        if (value.Album != null) writer.WriteString("album", value.Album);
        if (value.Date != null) writer.WriteString("date", value.Date.ToString());
        if (value.Genre != null) writer.WriteString("genre", value.Genre);
        if (value.Description != null) writer.WriteString("description", value.Description);
        if (value.TrackNumber is { } track) writer.WriteNumber("track", track);
        if (value.DiscographyUrl is { } discographyUrl) writer.WriteString("discographyUrl", discographyUrl);
        if (value.LyricsUrl is { } lyricsUrl) writer.WriteString("lyricsUrl", lyricsUrl);
        WriteCollection(writer, "albumArts", value.AlbumArts);
        WriteCollection(writer, "artists", value.Artists);
        WriteCollection(writer, "actors", value.Actors);
        WriteCollection(writer, "authors", value.Authors);
        WriteCollection(writer, "producers", value.Producers);
        WriteCollection(writer, "directors", value.Directors);
        WriteCollection(writer, "publishers", value.Publishers);
        WriteCollection(writer, "genres", value.Genres);
        WriteResource(writer, value, options);
        WriteVendorProps(writer, value);
        writer.WriteEndObject();
    }
}