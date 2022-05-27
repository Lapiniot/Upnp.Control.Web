using System.Text.Json;

namespace Upnp.Control.Infrastructure.PushNotifications;

internal static class ConfigMigrations
{
    public static async Task EnsureVapidConfigExistsAsync(string path, IConfiguration configuration)
    {
        if (File.Exists(path))
        {
            using var doc = await ReadJsonAsync(path).ConfigureAwait(false);
            if (!doc.RootElement.TryGetProperty("VAPID", out _))
            {
                await WriteUpgradedConfigAsync(path, doc).ConfigureAwait(false);
                (configuration as IConfigurationRoot)?.Reload();
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
        await using var stream = new FileStream(path, FileMode.Open, FileAccess.Read);
        return await JsonDocument.ParseAsync(stream).ConfigureAwait(false);
    }

    private static async Task WriteUpgradedConfigAsync(string path, JsonDocument originalConfig)
    {
        await using var stream = new FileStream(path, FileMode.Create, FileAccess.Write);
        await using var writer = new Utf8JsonWriter(stream, new() { Indented = true });
        var (publicKey, privateKey) = CryptoExtensions.GenerateP256ECKeys();
        writer.WriteStartObject();
        if (originalConfig is not null)
        {
            foreach (var item in originalConfig.RootElement.EnumerateObject())
                item.WriteTo(writer);
        }

        writer.WriteStartObject("VAPID");
        writer.WriteString("PublicKey", Encoders.ToBase64String(publicKey));
        writer.WriteString("PrivateKey", Encoders.ToBase64String(privateKey));
        writer.WriteEndObject();
        writer.WriteEndObject();
        await writer.FlushAsync().ConfigureAwait(false);
    }
}