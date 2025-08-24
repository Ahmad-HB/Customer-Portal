using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Identity;

namespace Customer.Portal.DbMigrator.DataSeeders;

public class IdentityUserDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    
    #region Fields

    private readonly IdentityUserManager _userManager;
    private readonly IIdentityUserAppService _identityUserAppService;

    #endregion
    
    public Task SeedAsync(DataSeedContext context)
    {
        return Task.CompletedTask;
    }
}