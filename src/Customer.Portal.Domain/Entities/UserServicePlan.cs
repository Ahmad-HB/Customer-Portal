using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Customer.Portal.Entities;

public class UserServicePlan : FullAuditedEntity<Guid>
{
    public Guid ServicePlanId { get; set; }
    
    public ServicePlan ServicePlan { get; set; }
    
    public Guid AppUserId { get; set; }
    
    public AppUser AppUser { get; set; }
    
    public bool IsActive { get; set; }

    public bool IsSuspended { get; set; }

    public string? SuspensionReason { get; set; }
    
    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public UserServicePlan( Guid id, Guid servicePlanId, Guid appUserId, bool isActive, DateTime startDate, DateTime endDate) : base(id)
    {
        id = Id;
        ServicePlanId = servicePlanId;
        AppUserId = appUserId;
        IsActive = isActive;
        StartDate = startDate;
        EndDate = endDate;
    }

}