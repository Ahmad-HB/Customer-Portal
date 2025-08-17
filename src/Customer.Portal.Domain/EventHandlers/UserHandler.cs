using System;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.FeaturesManagers.MAppUser;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Entities.Events;
using Volo.Abp.EventBus;
using Volo.Abp.Identity;

namespace Customer.Portal.EventHandlers;

public class UserHandler : ILocalEventHandler<EntityCreatedEventData<IdentityUser>>,
    ITransientDependency,
    ILocalEventHandler<EntityCreatedEventData<AppUser>>
{

    #region Fields

    private readonly Lazy<IdentityUserManager> _identityUserManager;
    public readonly Lazy<AppUserManager> _appUserManager;

    #endregion


    #region Ctor

    public UserHandler(Lazy<IdentityUserManager> identityUserManager, Lazy<AppUserManager> appUserManager)
    {
        _identityUserManager = identityUserManager;
        _appUserManager = appUserManager;
    }

    #endregion
    
    
    public async Task HandleEventAsync(EntityCreatedEventData<IdentityUser> eventData)
    {
        var identityUser = eventData.Entity;
        var tenantId = eventData.Entity.TenantId;
        
        await _appUserManager.Value.RegisterAppUserAsync(identityUser, tenantId);
        
    }

    public async Task HandleEventAsync(EntityCreatedEventData<AppUser> eventData)
    {
        // var appUser = eventData.Entity;
        //
        // await _appUserManager.Value.CompleteAppUserRegisterAsync(appUser.Id, appUser.UserType);
        
        throw new NotImplementedException();
    }
}