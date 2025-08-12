using Volo.Abp.Modularity;

namespace Customer.Portal;

/* Inherit from this class for your domain layer tests. */
public abstract class PortalDomainTestBase<TStartupModule> : PortalTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
