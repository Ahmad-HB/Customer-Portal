using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Customer.Portal.DTOs.ServicePlanDTOs;

public interface IServicePlanAppService : IApplicationService
{
    public Task<ServicePlanDto> GetServicePlanAsync(Guid id);
    
    public Task<PagedResultDto<ServicePlanDto>> GetServicePlansAsync();
    
    public Task SubcribeToServicePlanAsync(Guid servicePlanId);
    
}