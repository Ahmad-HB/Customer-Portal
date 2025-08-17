using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Customer.Portal.Entities;

public class ServicePlan : FullAuditedEntity<Guid>
{
    public string Name { get; set; }

    public string Description { get; set; }

    public decimal Price { get; set; }
    
    public int Count { get; set; }
}