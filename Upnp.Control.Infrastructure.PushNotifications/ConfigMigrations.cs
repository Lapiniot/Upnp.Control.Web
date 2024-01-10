using System.Text.Json;
using OOs.Net.Http.WebPush;
using Upnp.Control.Abstractions;

namespace Upnp.Control.Infrastructure.PushNotifications;

internal static class ConfigMigrations
{
    private const int MaxAllowedOnStack = 512;

    public static async Task EnsureVapidConfigExistsAsync(string path, IConfiguration configuration, IBase64UrlEncoder base64Encoder)
    {
        if (File.Exists(path))
        {
            using var doc = await ReadJsonAsync(path).ConfigureAwait(false);
            if (!doc.RootElement.TryGetProperty("VAPID", out _))
            {
                await WriteUpgradedConfigAsync(path, doc, base64Encoder).ConfigureAwait(false);
                (configuration as IConfigurationRoot)?.Reload();
            }
        }
        else
        {
            await WriteUpgradedConfigAsync(path, null, base64Encoder).ConfigureAwait(false);
            (configuration as IConfigurationRoot)?.Reload();
        }
    }

    private static async Task<JsonDocument> ReadJsonAsync(string path)
    {
        var stream = new FileStream(path, FileMode.Open, FileAccess.Read);
        await using (stream.ConfigureAwait(false))
            return await JsonDocument.ParseAsync(stream).ConfigureAwait(false);
    }

    private static async Task WriteUpgradedConfigAsync(string path, JsonDocument originalConfig, IBase64UrlEncoder base64Encoder)
    {
        var stream = new FileStream(path, FileMode.Create, FileAccess.Write);
        await using (stream.ConfigureAwait(false))
        {
            var writer = new Utf8JsonWriter(stream, new() { Indented = true });
            await using (writer.ConfigureAwait(false))
            {
                var (publicKey, privateKey) = ServerKeyGenerator.Generate();
                writer.WriteStartObject();
                if (originalConfig is not null)
                {
                    foreach (var item in originalConfig.RootElement.EnumerateObject())
                        item.WriteTo(writer);
                }

                WriteKeysObject(writer, publicKey, privateKey, base64Encoder);
                writer.WriteEndObject();
                await writer.FlushAsync().ConfigureAwait(false);
            }
        }
    }

    private static void WriteKeysObject(Utf8JsonWriter writer, byte[] publicKey, byte[] privateKey, IBase64UrlEncoder base64Encoder)
    {
        var maxLength = base64Encoder.GetMaxEncodedToUtf8Length(Math.Max(publicKey.Length, privateKey.Length));
        Span<byte> buffer = maxLength <= MaxAllowedOnStack
            ? stackalloc byte[MaxAllowedOnStack]
            : new byte[maxLength];
        writer.WriteStartObject("VAPID"u8);
        base64Encoder.EncodeToUtf8(publicKey, buffer, out var bytesWritten);
        writer.WriteString("PublicKey"u8, buffer[..bytesWritten]);
        base64Encoder.EncodeToUtf8(privateKey, buffer, out bytesWritten);
        writer.WriteString("PrivateKey"u8, buffer[..bytesWritten]);
        writer.WriteEndObject();
    }
}