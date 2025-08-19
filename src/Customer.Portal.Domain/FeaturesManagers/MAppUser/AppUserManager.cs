using System;
using System.Collections.Generic;
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

    public async Task<List<AppUser>> GetAllAppUsers()
    {
        var userList = await _appUserRepository.GetListAsync();

        return userList;
    }

    public async Task<AppUser> GetUserByIdAsync(Guid id)
    {
        return await _appUserRepository.GetAsync(id);
    }

    public Task CompleteAppUserRegisterAsync(Guid AppUserId, UserType userType)
    {
        return Task.CompletedTask;
    }

    #endregion
}