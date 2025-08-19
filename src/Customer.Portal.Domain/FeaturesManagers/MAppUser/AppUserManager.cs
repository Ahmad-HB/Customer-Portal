using System;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;
using Volo.Abp.Identity;

namespace Customer.Portal.FeaturesManagers.MAppUser;

public class AppUserManager : DomainService, IAppUserManager
{
    #region Fields

    private readonly IGuidGenerator _guidGenerator;
    private readonly IRepository<AppUser, Guid> _appUserRepository;

    #endregion

    #region Ctor

    public AppUserManager(IRepository<AppUser, Guid> appUserRepository, IGuidGenerator guidGenerator)
    {
        _appUserRepository = appUserRepository;
        _guidGenerator = guidGenerator;
    }

    #endregion

    #region Methods

    public async Task RegisterAppUserAsync(IdentityUser identityUser, Guid? tenantId)
    {
        await _appUserRepository.InsertAsync(new AppUser(
            _guidGenerator.Create(),
            identityUser.UserName, 
            identityUser.Email,
            identityUser.PhoneNumber,
            true, 
            UserType.Customer, 
            identityUser.Id));
    }

    public Task CompleteAppUserRegisterAsync(Guid AppUserId, UserType userType)
    {
        Console.WriteLine("nega");
        // Here you can implement the logic to complete the registration of the AppUser
        
        // For example, you might want to update the AppUser's UserType or perform other actions.
        
        return Task.CompletedTask;
    }

    #endregion
}