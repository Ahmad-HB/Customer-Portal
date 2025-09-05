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
        
        var appUserDtos = new List<AppUserDto>();
        
        foreach (var appUser in appUsersList)
        {
            var appUserDto = ObjectMapper.Map<AppUser, AppUserDto>(appUser);
            
            // Check if IdentityUserId is empty (00000000-0000-0000-0000-000000000000)
            if (appUser.IdentityUserId == Guid.Empty)
            {
                // Try to find IdentityUser by email as fallback
                var identityUser = await _identityUserManager.FindByEmailAsync(appUser.Email);
                if (identityUser != null)
                {
                    appUserDto.Username = identityUser.UserName;
                    appUserDto.IdentityUserId = identityUser.Id;
                    
                    // Get user roles
                    var roles = await _identityUserManager.GetRolesAsync(identityUser);
                    appUserDto.Role = roles.Count > 0 ? roles[0] : "No Role";
                }
                else
                {
                    appUserDto.Username = "Unknown";
                    appUserDto.Role = "No Role";
                }
            }
            else
            {
                // Get the IdentityUser to retrieve username and roles
                var identityUser = await _identityUserManager.FindByIdAsync(appUser.IdentityUserId.ToString());
                if (identityUser != null)
                {
                    appUserDto.Username = identityUser.UserName;
                    
                    // Get user roles
                    var roles = await _identityUserManager.GetRolesAsync(identityUser);
                    appUserDto.Role = roles.Count > 0 ? roles[0] : "No Role";
                }
                else
                {
                    appUserDto.Username = "Unknown";
                    appUserDto.Role = "No Role";
                }
            }
            
            appUserDtos.Add(appUserDto);
        }

        return new PagedResultDto<AppUserDto>(appUserDtos.Count, appUserDtos);
    }

    public async Task<AppUserDto> GetUserByIdAsync(Guid id)
    {
        var appUser = await _appUserManager.GetUserByIdAsync(id);
        
        var appUserDto = ObjectMapper.Map<AppUser, AppUserDto>(appUser);
        
        // Get the IdentityUser to retrieve username and roles
        var identityUser = await _identityUserManager.FindByIdAsync(appUser.IdentityUserId.ToString());
        if (identityUser != null)
        {
            appUserDto.Username = identityUser.UserName;
            
            // Get user roles
            var roles = await _identityUserManager.GetRolesAsync(identityUser);
            appUserDto.Role = roles.Count > 0 ? roles[0] : "No Role";
        }
        else
        {
            appUserDto.Username = "Unknown";
            appUserDto.Role = "No Role";
        }
        
        return appUserDto;
    }
    
    public async Task<AppUserDto> GetCurrentAppUserAsync()
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("Current user is not logged in.");
        
        var currentUser = await _appUserManager.GetCurrentAppUserAsync(identityUserId);
        
        var currentUserDto = ObjectMapper.Map<AppUser, AppUserDto>(currentUser);
        
        // Get the IdentityUser to retrieve username and roles
        var identityUser = await _identityUserManager.FindByIdAsync(identityUserId.ToString());
        if (identityUser != null)
        {
            currentUserDto.Username = identityUser.UserName;
            
            // Get user roles
            var roles = await _identityUserManager.GetRolesAsync(identityUser);
            currentUserDto.Role = roles.Count > 0 ? roles[0] : "No Role";
        }
        else
        {
            currentUserDto.Username = "Unknown";
            currentUserDto.Role = "No Role";
        }
        
        return currentUserDto;
    }
    
    public async Task<string> GetCurrntUserRoleAsync()
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("Current user is not logged in.");
        
        var role = await _identityUserManager.GetRolesAsync((await _identityUserManager.FindByIdAsync(identityUserId.ToString() ?? "User not found."))!);
        
        return role.Count > 0 ? role[0] : string.Empty;
    }
    
    public async Task<PagedResultDto<AppUserDto>> GetSupportAgentsAsync()
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("Current user is not logged in.");
        
        var supportAgents = await _appUserManager.GetSupportAgentsAsync(); 
        
        var supportAgentsDto = new List<AppUserDto>();
        
        foreach (var appUser in supportAgents)
        {
            var appUserDto = ObjectMapper.Map<AppUser, AppUserDto>(appUser);
            
            // Get the IdentityUser to retrieve username and roles
            var identityUser = await _identityUserManager.FindByIdAsync(appUser.IdentityUserId.ToString());
            if (identityUser != null)
            {
                appUserDto.Username = identityUser.UserName;
                
                // Get user roles
                var roles = await _identityUserManager.GetRolesAsync(identityUser);
                appUserDto.Role = roles.Count > 0 ? roles[0] : "No Role";
            }
            else
            {
                appUserDto.Username = "Unknown";
                appUserDto.Role = "No Role";
            }
            
            supportAgentsDto.Add(appUserDto);
        }
        
        return new PagedResultDto<AppUserDto>(supportAgentsDto.Count, supportAgentsDto);
    }
    
    public async Task<PagedResultDto<AppUserDto>> GetTechniciansAsync()
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("Current user is not logged in.");
        
        var technicians = await _appUserManager.GetTechniciansAsync();
        
        var techniciansDto = new List<AppUserDto>();
        
        foreach (var appUser in technicians)
        {
            var appUserDto = ObjectMapper.Map<AppUser, AppUserDto>(appUser);
            
            // Get the IdentityUser to retrieve username and roles
            var identityUser = await _identityUserManager.FindByIdAsync(appUser.IdentityUserId.ToString());
            if (identityUser != null)
            {
                appUserDto.Username = identityUser.UserName;
                
                // Get user roles
                var roles = await _identityUserManager.GetRolesAsync(identityUser);
                appUserDto.Role = roles.Count > 0 ? roles[0] : "No Role";
            }
            else
            {
                appUserDto.Username = "Unknown";
                appUserDto.Role = "No Role";
            }
            
            techniciansDto.Add(appUserDto);
        }
        
        return new PagedResultDto<AppUserDto>(techniciansDto.Count, techniciansDto);
    }
    
    public async Task FixMissingIdentityUserIdsAsync()
    {
        await _appUserManager.FixMissingIdentityUserIdsAsync();
    }

    #endregion
}