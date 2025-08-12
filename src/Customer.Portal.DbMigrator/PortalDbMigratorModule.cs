using Customer.Portal.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace Customer.Portal.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(PortalEntityFrameworkCoreModule),
    typeof(PortalApplicationContractsModule)
)]
public class PortalDbMigratorModule : AbpModule
{
}
