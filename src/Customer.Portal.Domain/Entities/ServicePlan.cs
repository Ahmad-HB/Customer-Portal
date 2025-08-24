using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Customer.Portal.Entities;

public class ServicePlan : FullAuditedEntity<Guid>
{
    public string Name { get; set; }

    public string Description { get; set; }

    public decimal Price { get; set; }
    
    public int Count { get; set; }


    public ServicePlan(Guid Id, string name, string description, decimal price) : base(Id)
    {
        Id = Id;
        Name = name;
        Description = description;
        Price = price;
    }
}