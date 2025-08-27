using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;
using Volo.Abp.Identity;

namespace Customer.Portal.FeaturesManagers.MServicePlan;

public class ServicePlanManager : DomainService, IServicePlanManager
{

    #region Feilds

    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IRepository<ServicePlan, Guid> _servicePlanManager;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IGuidGenerator _guidGenerator;

    #endregion


    #region Ctor

    public ServicePlanManager(IRepository<IdentityUser, Guid> identityUserRepository, IRepository<ServicePlan, Guid> servicePlanManager, IRepository<AppUser, Guid> appUserRepository, IGuidGenerator guidGenerator)
    {
        _identityUserRepository = identityUserRepository;
        _servicePlanManager = servicePlanManager;
        _appUserRepository = appUserRepository;
        _guidGenerator = guidGenerator;
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

    #endregion
    
}