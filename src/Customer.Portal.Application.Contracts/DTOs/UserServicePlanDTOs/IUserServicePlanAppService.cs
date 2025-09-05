using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Customer.Portal.DTOs.UserServicePlanDTOs;

public interface IUserServicePlanAppService : IApplicationService
{
    public Task<PagedResultDto<UserServicePlanDto>> GetUserServicePlansAsync();
    
    public Task<UserServicePlanDto> GetUserServicePlanAsync(Guid id);
    
    public Task SuspendUserServicePlanAsync(SuspendUserServicePlanDto input);
    
    public Task ReactivateUserServicePlanAsync(Guid id);
    
    public Task CancelUserServicePlanAsync(Guid id);
    
}