using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;
using Volo.Abp.Identity;

namespace Customer.Portal.FeaturesManagers.MServicePlan;

public class ServicePlanManager : DomainService, IServicePlanManager
{

    #region Feilds

    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IRepository<UserServicePlan, Guid> _usersServicePlanRepository;
    private readonly IRepository<ServicePlan, Guid> _servicePlanManager;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IGuidGenerator _guidGenerator;

    #endregion


    #region Ctor

    public ServicePlanManager(IRepository<IdentityUser, Guid> identityUserRepository, IRepository<ServicePlan, Guid> servicePlanManager, IRepository<AppUser, Guid> appUserRepository, IGuidGenerator guidGenerator, IRepository<UserServicePlan, Guid> usersServicePlanRepository)
    {
        _identityUserRepository = identityUserRepository;
        _servicePlanManager = servicePlanManager;
        _appUserRepository = appUserRepository;
        _guidGenerator = guidGenerator;
        _usersServicePlanRepository = usersServicePlanRepository;
    }

    #endregion


    #region Methods

    public async Task<ServicePlan> GetServicePlanAsync(Guid id)
    {
        return await _servicePlanManager.GetAsync(id);
    }

    public async Task<List<ServicePlan>> GetServicePlansAsync()
    {
        return await _servicePlanManager.GetListAsync();
    }

    public async Task SubcribeToServicePlanAsync(Guid identityUserId, Guid servicePlanId)
    {
        var query = await _identityUserRepository.GetQueryableAsync();
        var identityUser = await _identityUserRepository.GetAsync(identityUserId);
        if (identityUser == null)
        {
            throw new UserFriendlyException("Identity User not found.");
        }
        
        var appUserId = await query
            .Where(u => u.Id == identityUserId)
            .Select(u => EF.Property<Guid>(u, "AppUserId"))
            .FirstOrDefaultAsync();

        var appUser = await _appUserRepository.FirstOrDefaultAsync(x => x.Id == appUserId);
        if (appUser == null)
        {
            throw new UserFriendlyException("App user not found.");
        }

        var servicePlan = await _servicePlanManager.GetAsync(servicePlanId);
        if (servicePlan == null)
        {
            throw new UserFriendlyException("Service plan not found.");
        }

        var userServicePlan = new UserServicePlan(
            _guidGenerator.Create(),
            servicePlanId,
            appUser.Id,
            true,
            DateTime.UtcNow,
            DateTime.UtcNow.AddMonths(1)
        );
        
        userServicePlan.IsSuspended = false;

        await _usersServicePlanRepository.InsertAsync(userServicePlan);
    }

    #endregion
    
}