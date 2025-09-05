using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MUserServicePlan;

public interface IUserServicePlanManager : IDomainService
{
    public Task<List<UserServicePlan>> GetUserServicePlansAsync(Guid identityUserId);
    
    public Task<UserServicePlan> GetUserServicePlanAsync(Guid identityUserId, Guid id);
    
    public Task SuspendUserServicePlanAsync(Guid identityUserId, Guid id, string? suspensionReason = null);
    
    public Task ReactivateUserServicePlanAsync(Guid identityUserId, Guid id);
    
    public Task CancelUserServicePlanAsync(Guid identityUserId, Guid id);
}