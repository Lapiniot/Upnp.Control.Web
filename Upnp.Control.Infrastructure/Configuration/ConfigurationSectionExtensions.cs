namespace Upnp.Control.Infrastructure.Configuration;

public static class ConfigurationSectionExtensions
{
    public static IEnumerable<IConfigurationSection> TraverseTreeDeep(this IConfigurationSection section)
    {
        var stack = new Stack<IConfigurationSection>();
        stack.Push(section);

        while (stack.TryPop(out section))
        {
            yield return section;
            foreach (var child in section.GetChildren())
            {
                stack.Push(child);
            }
        }
    }

    public static IEnumerable<IConfigurationSection> TraverseTreeWide(this IConfigurationSection section)
    {
        var queue = new Queue<IConfigurationSection>();
        queue.Enqueue(section);

        while (queue.TryDequeue(out section))
        {
            yield return section;
            foreach (var child in section.GetChildren())
            {
                queue.Enqueue(child);
            }
        }
    }
}