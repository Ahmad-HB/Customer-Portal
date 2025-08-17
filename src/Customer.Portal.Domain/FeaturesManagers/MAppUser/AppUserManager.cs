using System;
using System.Threading.Tasks;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Services;
using Volo.Abp.Identity;

namespace Customer.Portal.FeaturesManagers.MAppUser;

public class AppUserManager : DomainService ,IAppUserManager
{

    #region Fields

    

    #endregion

    #region Ctor

    public AppUserManager()
    {
        
    }

    #endregion

    #region Methods

    public Task RegisterAppUserAsync(IdentityUser identityUser, Guid? tenantId)
    {
        throw new NotImplementedException();
    }

    public Task CompleteAppUserRegisterAsync(Guid AppUserId, UserType userType)
    {
        throw new NotImplementedException();
    }

    #endregion
    
    
}