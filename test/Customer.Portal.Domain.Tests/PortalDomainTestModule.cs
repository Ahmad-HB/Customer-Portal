using Volo.Abp.Modularity;

namespace Customer.Portal;

[DependsOn(
    typeof(PortalDomainModule),
    typeof(PortalTestBaseModule)
)]
public class PortalDomainTestModule : AbpModule
{

}
