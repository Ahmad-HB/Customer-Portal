using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.DTOs.AppUserDTOs;
using Customer.Portal.Entities;
using Customer.Portal.FeaturesManagers.MAppUser;
using Volo.Abp.Account;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.Services.AppUserServices;

public class AppUserService : PortalAppService, IAppUserAppService
{

    #region Fields

    private readonly IAppUserManager _appUserManager;

    #endregion


    #region Ctor

    public AppUserService(IAppUserManager appUserManager)
    {
        _appUserManager = appUserManager;
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

    #endregion
}