using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Customer.Portal.Entities;

public class ServicePlan : FullAuditedEntity<Guid>
{
    public string Name { get; set; }

    public string Description { get; set; }

    public decimal Price { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }

    public bool IsSuspended { get; set; }

    public string SuspensionReason { get; set; }
}