using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.DTOs.ServicePlanDTOs;
using Customer.Portal.Entities;
using Customer.Portal.FeaturesManagers.MServicePlan;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Users;

namespace Customer.Portal.Services.ServicePlanServices;

public class ServicePlanAppService : PortalAppService, IServicePlanAppService
{

    #region Felds

    private readonly IServicePlanManager _servicePlanManager;
    private readonly ICurrentUser _currentUser;

    #endregion

    #region Ctor

    public ServicePlanAppService(IServicePlanManager servicePlanManager, ICurrentUser currentUser)
    {
        _servicePlanManager = servicePlanManager;
        _currentUser = currentUser;
    }

    #endregion
    
    #region Methods

    public async Task<ServicePlanDto> GetServicePlanAsync(Guid id)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        var servicePlan = await  _servicePlanManager.GetServicePlanAsync(id);
        
        return ObjectMapper.Map<ServicePlan, ServicePlanDto>(servicePlan);
        
    }

    public async Task<PagedResultDto<ServicePlanDto>> GetServicePlansAsync()
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        var servicePlans = await  _servicePlanManager.GetServicePlansAsync();
        
        return new PagedResultDto<ServicePlanDto>(servicePlans.Count, ObjectMapper.Map<List<ServicePlan>, List<ServicePlanDto>>(servicePlans));
    }

    #endregion
    
    
    
    
}