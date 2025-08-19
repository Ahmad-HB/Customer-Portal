using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Services;
using Volo.Abp.Identity;
using Volo.Abp.TenantManagement;

namespace Customer.Portal.FeaturesManagers.MAppUser;

public interface IAppUserManager : IDomainService
{
    public Task RegisterAppUserAsync (IdentityUser identityUser, Guid? tenantId);
    
    public Task<List<AppUser>> GetAllAppUsers();
    
    public Task<AppUser> GetUserByIdAsync(Guid id);
    
    
    
}