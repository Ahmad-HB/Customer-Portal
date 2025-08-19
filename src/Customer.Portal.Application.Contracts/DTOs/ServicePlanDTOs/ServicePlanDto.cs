using System;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.ServicePlanDTOs;

public class ServicePlanDto : FullAuditedEntityDto<Guid>
{
    public string Name { get; set; }

    public string Description { get; set; }

    public decimal Price { get; set; }
    
    public int Count { get; set; }
}