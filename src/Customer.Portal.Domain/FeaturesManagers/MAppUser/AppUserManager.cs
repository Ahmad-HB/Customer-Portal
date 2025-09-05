using System;
using System.Collections.Generic;
using System.Linq;
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
    private readonly IdentityUserManager _userManager;

    #endregion

    #region Ctor

    public AppUserManager(IRepository<AppUser, Guid> appUserRepository, IGuidGenerator guidGenerator, IdentityUserManager userManager)
    {
        _appUserRepository = appUserRepository;
        _guidGenerator = guidGenerator;
        _userManager = userManager;
    }

    #endregion

    #region Methods

    public async Task RegisterAppUserAsync(IdentityUser identityUser, Guid? tenantId)
    {
        // Check if AppUser already exists for this IdentityUserId
        var existingAppUser = await _appUserRepository.FirstOrDefaultAsync(u => u.IdentityUserId == identityUser.Id);
        if (existingAppUser != null)
        {
            // AppUser already exists, no need to create a new one
            return;
        }

        // Determine UserType based on user's roles
        var userType = await DetermineUserTypeAsync(identityUser);

        var appUser = new AppUser(
            _guidGenerator.Create(),
            identityUser.Name, 
            identityUser.UserName,
            identityUser.Email,
            identityUser.PhoneNumber ?? "+0000000000",
            true, 
            userType, 
            identityUser.Id);

        await _appUserRepository.InsertAsync(appUser);
    }

    private async Task<UserType> DetermineUserTypeAsync(IdentityUser identityUser)
    {
        // First try to get user's roles (in case they're already assigned)
        var userRoles = await _userManager.GetRolesAsync(identityUser);
        
        if (userRoles.Contains("Admin"))
            return UserType.Admin;
        else if (userRoles.Contains("SupportAgent"))
            return UserType.SupportAgent;
        else if (userRoles.Contains("Technician"))
            return UserType.Technician;
        
        // If roles aren't assigned yet, determine UserType based on email domain
        // This handles the case where the event handler runs before roles are assigned
        if (identityUser.Email != null)
        {
            if (identityUser.Email.EndsWith("@admin.com"))
                return UserType.Admin;
            else if (identityUser.Email.EndsWith("@support.com"))
                return UserType.SupportAgent;
            else if (identityUser.Email.EndsWith("@technician.com"))
                return UserType.Technician;
        }
        
        return UserType.Customer; // Default fallback
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
    
    public async Task<AppUser> GetCurrentAppUserAsync(Guid identityUserId)
    {
        var appUser = await _appUserRepository.FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId);

        if (appUser == null)
        {
            throw new Exception("AppUser not found for the given IdentityUserId.");
        }

        return appUser;
    }
    
    public async Task GetCurrentUserRoleAsync(Guid identityUserId)
    {
        await Task.CompletedTask;
    }
    
    public async Task<List<AppUser>> GetSupportAgentsAsync()
    {
        var query = await _appUserRepository.GetQueryableAsync();
        var supportAgents = await AsyncExecuter.ToListAsync(
            query.Where(x => x.UserType == UserType.SupportAgent && x.IsActive)
        );
        
        return supportAgents;
    }
    
    public async Task<List<AppUser>> GetTechniciansAsync()
    {
        var query = await _appUserRepository.GetQueryableAsync();
        var technicians = await AsyncExecuter.ToListAsync(
            query.Where(x => x.UserType == UserType.Technician && x.IsActive)
        );
        
        return technicians;
    }
    
    public async Task FixMissingIdentityUserIdsAsync()
    {
        // Get all AppUsers with empty IdentityUserId
        var appUsersWithEmptyIdentityUserId = await _appUserRepository.GetListAsync(u => u.IdentityUserId == Guid.Empty);
        
        foreach (var appUser in appUsersWithEmptyIdentityUserId)
        {
            // Try to find the corresponding IdentityUser by email
            var identityUser = await _userManager.FindByEmailAsync(appUser.Email);
            if (identityUser != null)
            {
                // Update the AppUser with the correct IdentityUserId
                appUser.IdentityUserId = identityUser.Id;
                await _appUserRepository.UpdateAsync(appUser);
            }
        }
    }
    
    public async Task SyncAppUserWithIdentityUserAsync(IdentityUser identityUser)
    {
        // Find the corresponding AppUser
        var appUser = await _appUserRepository.FirstOrDefaultAsync(u => u.IdentityUserId == identityUser.Id);
        if (appUser == null)
        {
            throw new Exception($"AppUser not found for the given {identityUser.Id}.");
        }
        
        // Update AppUser properties to match IdentityUser
        appUser.Name = identityUser.Name;
        appUser.UserName = identityUser.UserName;
        appUser.Email = identityUser.Email;
        appUser.PhoneNumber = identityUser.PhoneNumber;
        
        // Determine if user is active based on IdentityUser propertie
        appUser.IsActive = identityUser.IsActive;
        
        // Update UserType based on roles
        var userType = await DetermineUserTypeAsync(identityUser);
        appUser.UserType = userType;
        
        await _appUserRepository.UpdateAsync(appUser);
    }

    #endregion
}