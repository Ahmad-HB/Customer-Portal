using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.DTOs.AppUserDTOs;
using Customer.Portal.Entities;
using Customer.Portal.FeaturesManagers.MAppUser;
using Volo.Abp;
using Volo.Abp.Account;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Identity;
using Volo.Abp.Users;

namespace Customer.Portal.Services.AppUserServices;

public class AppUserService : PortalAppService, IAppUserAppService
{

    #region Fields

    private readonly IAppUserManager _appUserManager;
    private readonly ICurrentUser _currentUser;
    private readonly IdentityUserManager _identityUserManager;

    #endregion


    #region Ctor

    public AppUserService(IAppUserManager appUserManager, ICurrentUser currentUser, IdentityUserManager identityUserManager)
    {
        _appUserManager = appUserManager;
        _currentUser = currentUser;
        _identityUserManager = identityUserManager;
    }

    #endregion


    #region Methods

    public async Task<PagedResultDto<AppUserDto>> GetUsers()
    {
        var appUsersList = await _appUserManager.GetAllAppUsers();
        
        var appUserDtos = ObjectMapper.Map<List<AppUser>, List<AppUserDto>>(appUsersList);


        return new PagedResultDto<AppUserDto>(appUserDtos.Count, appUserDtos);
    }

    public async Task<AppUserDto> GetUserByIdAsync(Guid id)
    {
        var appUser = await _appUserManager.GetUserByIdAsync(id);
        
        var appUserDto = ObjectMapper.Map<AppUser, AppUserDto>(appUser);
        
        return appUserDto;
    }
    
    public async Task<AppUserDto> GetCurrentAppUserAsync()
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("Current user is not logged in.");
        
        var currentUser = await _appUserManager.GetCurrentAppUserAsync(identityUserId);
        
        var currentUserDto = ObjectMapper.Map<AppUser, AppUserDto>(currentUser);
        
        return currentUserDto;
    }
    
    public async Task<string> GetCurrntUserRoleAsync()
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("Current user is not logged in.");
        
        var role = await _identityUserManager.GetRolesAsync(await _identityUserManager.FindByIdAsync(identityUserId.ToString()));
        
        return role.Count > 0 ? role[0] : string.Empty;
    }

    #endregion
}