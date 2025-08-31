using System;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.UserServicePlanDTOs;

public class UserServicePlanDto : FullAuditedEntityDto<Guid>
{
    public Guid ServicePlanId { get; set; }
    public string ServicePlanName { get; set; }
    
    // public ServicePlan ServicePlan { get; set; }
    
    public Guid AppUserId { get; set; }

    public string AppUserName { get; set; }
    
    // public AppUser AppUser { get; set; }
    
    public bool IsActive { get; set; }

    public bool IsSuspended { get; set; }

    public string? SuspensionReason { get; set; }
    
    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }
}