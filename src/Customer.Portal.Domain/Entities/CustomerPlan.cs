using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Identity;

namespace Customer.Portal.Entities;

public class CustomerPlan : FullAuditedEntity<Guid>
{
    public Guid IdentityUserId { get; set; }
    
    public IdentityUser IdentityUser { get; set; }

    public Guid ServicePlanId { get; set; }
    
    public ServicePlan ServicePlan { get; set; }
    
    public DateTime StartDate { get; set; }
    
    public DateTime EndDate { get; set; }
    
    public bool IsActive { get; set; }
    
    public bool IsSuspended { get; set; }

    public string SuspensionReason { get; set; }
}