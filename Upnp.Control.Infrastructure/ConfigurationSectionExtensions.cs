namespace Upnp.Control.Infrastructure;

public static class ConfigurationSectionExtensions
{
    extension(IConfigurationSection section)
    {
        public IEnumerable<IConfigurationSection> TraverseTreeDeep()
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

        public IEnumerable<IConfigurationSection> TraverseTreeWide()
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
}