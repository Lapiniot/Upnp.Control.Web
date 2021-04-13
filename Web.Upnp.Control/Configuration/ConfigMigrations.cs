using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;

namespace Web.Upnp.Control.Configuration
{
    internal static class ConfigMigrations
    {
        public static async Task EnsureVapidKeysExistAsync(string contentRootPath, IConfiguration configuration)
        {
            var path = Path.Combine(contentRootPath, "appsettings.Secrets.json");

            if(File.Exists(path))
            {
                using(var doc = await ReadJsonAsync(path).ConfigureAwait(false))
                {
                    if(!doc.RootElement.TryGetProperty("VAPID", out var vapid))
                    {
                        await WriteUpgradedConfigAsync(path, doc).ConfigureAwait(false);
                        (configuration as IConfigurationRoot)?.Reload();
                    }
                }
            }
            else
            {
                await WriteUpgradedConfigAsync(path, null).ConfigureAwait(false);
                (configuration as IConfigurationRoot)?.Reload();
            }
        }

        private static async Task<JsonDocument> ReadJsonAsync(string path)
        {
            using(var stream = new FileStream(path, FileMode.Open, FileAccess.Read))
            {
                return await JsonDocument.ParseAsync(stream).ConfigureAwait(false);
            }
        }

        private static async Task WriteUpgradedConfigAsync(string path, JsonDocument originalConfig)
        {
            using(var stream = new FileStream(path, FileMode.Create, FileAccess.Write))
            using(var writer = new Utf8JsonWriter(stream, new JsonWriterOptions() { Indented = true }))
            {
                var (publicKey, privateKey) = CryptoExtensions.GenerateP256ECKeys();
                writer.WriteStartObject();
                if(originalConfig is not null)
                {
                    foreach(var item in originalConfig.RootElement.EnumerateObject())
                        item.WriteTo(writer);
                }
                writer.WriteStartObject("VAPID");
                writer.WriteString("PublicKey", WebEncoders.Base64UrlEncode(publicKey));
                writer.WriteString("PrivateKey", WebEncoders.Base64UrlEncode(privateKey));
                writer.WriteEndObject();
                writer.WriteEndObject();
                await writer.FlushAsync().ConfigureAwait(false);
            }
        }
    }
}