using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MServicePlan;

public interface IServicePlanManager : IDomainService
{
    public Task<ServicePlan> GetServicePlanAsync(Guid id);
    
    public Task<List<ServicePlan>> GetServicePlansAsync();
    
    public Task SubcribeToServicePlanAsync(Guid identityUserId, Guid servicePlanId);
}