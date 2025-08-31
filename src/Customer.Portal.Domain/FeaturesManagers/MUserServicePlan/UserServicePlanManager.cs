using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Identity;

namespace Customer.Portal.FeaturesManagers.MUserServicePlan;

public class UserServicePlanManager : DomainService, IUserServicePlanManager
{
    #region Feilds

    private readonly IRepository<UserServicePlan, Guid> _userServicePlanRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;

    #endregion

    #region Ctor

    public UserServicePlanManager(IRepository<UserServicePlan, Guid> userServicePlanRepository, IRepository<IdentityUser, Guid> identityUserRepository)
    {
        _userServicePlanRepository = userServicePlanRepository;
        _identityUserRepository = identityUserRepository;
    }

    #endregion

    #region Methods

    public async Task<List<UserServicePlan>> GetUserServicePlansAsync(Guid identityUserId)
    {
        var query = await _identityUserRepository.GetQueryableAsync();
        var identityUser = await _identityUserRepository.GetAsync(identityUserId);
        if (identityUser == null)
        {
            throw new Exception("Identity user not found.");
        }
        
        var appUserId = await query
            .Where(u => u.Id == identityUserId)
            .Select(u => EF.Property<Guid>(u, "AppUserId"))
            .FirstOrDefaultAsync();

        return await _userServicePlanRepository.GetListAsync(u => u.AppUserId == appUserId);
    }

    public async Task<UserServicePlan> GetUserServicePlanAsync(Guid identityUserId, Guid id)
    {
        var query = await _identityUserRepository.GetQueryableAsync();
        var identityUser = await _identityUserRepository.GetAsync(identityUserId);
        if (identityUser == null)
        {
            throw new Exception("Identity user not found.");
        }
        
        var appUserId = await query
            .Where(u => u.Id == identityUserId)
            .Select(u => EF.Property<Guid>(u, "AppUserId"))
            .FirstOrDefaultAsync();

        var userServicePlan = await _userServicePlanRepository.GetAsync(id);
        if (userServicePlan == null || userServicePlan.AppUserId != appUserId)
        {
            throw new Exception("User service plan not found or does not belong to the user.");
        }

        return userServicePlan;
    }

    public async Task SuspendUserServicePlanAsync(Guid identityUserId, Guid id)
    {
        var userServicePlan = await GetUserServicePlanAsync(identityUserId, id);
        
        if (userServicePlan.IsActive == false)
        {
            throw new Exception("Only active service plans can be suspended.");
        }
        
        userServicePlan.IsActive = false;
        
        await _userServicePlanRepository.UpdateAsync(userServicePlan);
        
    }

    public async Task ReactivateUserServicePlanAsync(Guid identityUserId, Guid id)
    {
        var userServicePlan = await GetUserServicePlanAsync(identityUserId, id);
        
        if (userServicePlan.IsActive == true)
        {
            throw new Exception("Only suspended or ended service plans can be reactivated.");
        }
        
        userServicePlan.IsActive = true;
        userServicePlan.EndDate = userServicePlan.EndDate > DateTime.UtcNow ? userServicePlan.EndDate : DateTime.UtcNow.AddMonths(1);
        
        await _userServicePlanRepository.UpdateAsync(userServicePlan);
    }

    public async Task CancelUserServicePlanAsync(Guid identityUserId, Guid id)
    {
        var userServicePlan = await GetUserServicePlanAsync(identityUserId, id);
        
        if (userServicePlan.IsActive == false)
        {
            throw new Exception("Only active service plans can be cancelled.");
        }
        
        userServicePlan.IsActive = false;
        userServicePlan.EndDate = DateTime.UtcNow;
        
        await _userServicePlanRepository.UpdateAsync(userServicePlan);
    }

    #endregion
}