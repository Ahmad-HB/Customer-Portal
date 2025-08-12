using Volo.Abp.Modularity;

namespace Customer.Portal;

[DependsOn(
    typeof(PortalApplicationModule),
    typeof(PortalDomainTestModule)
)]
public class PortalApplicationTestModule : AbpModule
{

}
