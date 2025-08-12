using Volo.Abp.Modularity;

namespace Customer.Portal;

public abstract class PortalApplicationTestBase<TStartupModule> : PortalTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
