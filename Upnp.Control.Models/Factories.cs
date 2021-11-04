using IoT.Protocol.Upnp.DIDL;

namespace Upnp.Control.Models;

public static class Factories
{
    public static AVState CreateAVState(IReadOnlyDictionary<string, string> bag)
    {
        ArgumentNullException.ThrowIfNull(bag);

        var current = bag.TryGetValue("CurrentTrackMetaData", out var value) ? DIDLXmlParser.Parse(value, true, true).FirstOrDefault() : null;

        var next = bag.TryGetValue("NextTrackMetaData", out value) ? DIDLXmlParser.Parse(value, true, true).FirstOrDefault() : null;

        return new AVState(bag.TryGetValue("TransportState", out value) ? value : null, null,
                    bag.TryGetValue("NumberOfTracks", out value) && int.TryParse(value, out var tracks) ? tracks : null, null,
                    bag.TryGetValue("CurrentPlayMode", out value) ? value : null)
        {
            Actions = bag.TryGetValue("CurrentTransportActions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null,
            Current = current,
            Next = next,
            CurrentTrack = bag.TryGetValue("CurrentTrack", out value) ? value : null,
            CurrentTrackUri = bag.TryGetValue("CurrentTrackURI", out value) && !string.IsNullOrEmpty(value) ? new Uri(value) : null,
        };
    }

    public static AVPosition CreateAVPosition(IReadOnlyDictionary<string, string> bag)
    {
        ArgumentNullException.ThrowIfNull(bag);

        return new AVPosition(bag.TryGetValue("CurrentTrack", out var value) ? value : null,
            bag.TryGetValue("CurrentTrackDuration", out value) ? value : null,
            bag.TryGetValue("RelativeTimePosition", out value) ? value : null);
    }
}