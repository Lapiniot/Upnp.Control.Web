using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models.Converters
{
    public class MediaItemJsonConverter : JsonConverter<MediaItem>
    {
        public override MediaItem Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotSupportedException();
        }

        public override void Write(Utf8JsonWriter writer, MediaItem value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WriteString("id", value.Id);
            writer.WriteString("class", value.Class);
            writer.WriteString("title", value.Title);
            if(value.Creator != null) writer.WriteString("creator", value.Creator);
            if(value.Album != null) writer.WriteString("album", value.Album);
            if(value.Date != null) writer.WriteString("date", value.Date.ToString());
            if(value.Genre != null) writer.WriteString("genre", value.Genre);
            if(value.Description != null) writer.WriteString("description", value.Description);
            if(value.TrackNumber is {} track) writer.WriteNumber("track", track);

            if(value.Artists is {Count: > 0} artists)
            {
                writer.WriteStartArray("artists");
                foreach(var artist in artists) writer.WriteStringValue(artist);
                writer.WriteEndArray();
            }

            if(value.Authors is {Count: > 0} authors)
            {
                writer.WriteStartArray("authors");
                foreach(var author in authors) writer.WriteStringValue(author);
                writer.WriteEndArray();
            }

            if(value.Genres is {Count: > 0} genres)
            {
                writer.WriteStartArray("genres");
                foreach(var genre in genres) writer.WriteStringValue(genre);
                writer.WriteEndArray();
            }

            if(value.AlbumArts is {Count: > 0} albumArts)
            {
                writer.WriteStartArray("albumArts");
                foreach(var art in albumArts) writer.WriteStringValue(art);
                writer.WriteEndArray();
            }

            if(value.Vendor is {Count: > 0} vendor)
            {
                writer.WriteStartObject("vendor");
                foreach(var (k, v) in vendor)
                {
                    if(!string.IsNullOrWhiteSpace(v))
                    {
                        writer.WriteString(k, v);
                    }
                }

                writer.WriteEndObject();
            }

            if(value.Resource is {} res)
            {
                var resourceConverter = (JsonConverter<Resource>)options.GetConverter(typeof(Resource));
                writer.WritePropertyName("res");
                resourceConverter.Write(writer, res, options);
            }

            writer.WriteEndObject();
        }
    }
}