using static System.Globalization.CultureInfo;
using static System.Globalization.NumberStyles;

namespace Upnp.Control.Infrastructure.UpnpEvents;

public class EventSubscribeClient : IEventSubscribeClient
{
    private readonly HttpClient client;

    public EventSubscribeClient(HttpClient client)
    {
        ArgumentNullException.ThrowIfNull(client);

        this.client = client;
    }

    public async Task<(string Sid, int Timeout)> SubscribeAsync(Uri subscribeUri, Uri deliveryUri, TimeSpan timeout, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(deliveryUri);

        if (!deliveryUri.IsAbsoluteUri)
        {
            throw new ArgumentException("Only absolute uri is acceptable");
        }

        using var request = new HttpRequestMessage(new("SUBSCRIBE"), subscribeUri)
        {
            Headers = { { "NT", "upnp:event" }, { "CALLBACK", $"<{deliveryUri.AbsoluteUri}>" }, { "TIMEOUT", $"Second-{timeout.TotalSeconds}" } }
        };

        using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();

        return (response.Headers.GetValues("SID").First(),
            int.Parse(response.Headers.GetValues("TIMEOUT").Single().AsSpan(7), Integer, InvariantCulture));
    }

    public async Task<(string Sid, int Timeout)> RenewAsync(Uri subscribeUri, string sid, TimeSpan timeout, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(new("SUBSCRIBE"), subscribeUri)
        {
            Headers = { { "SID", sid }, { "TIMEOUT", $"Second-{timeout.TotalSeconds}" } }
        };

        using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();

        return (response.Headers.GetValues("SID").First(),
        int.Parse(response.Headers.GetValues("TIMEOUT").Single().AsSpan(7), Integer, InvariantCulture));
    }

    public async Task UnsubscribeAsync(Uri subscribeUri, string sid, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(new("UNSUBSCRIBE"), subscribeUri)
        {
            Headers = { { "SID", sid } }
        };

        using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();
    }
}