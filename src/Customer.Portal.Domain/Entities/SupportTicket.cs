using System;
using System.Collections.Generic;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Identity;

namespace Customer.Portal.Entities;

public class SupportTicket : FullAuditedAggregateRoot<Guid>
{
    public Guid AppUserId { get; set; }
    public AppUser AppUser { get; set; }
    
    public Guid? SupportagentId { get; set; }

    public IdentityUser Supportagent { get; set; }

    public Guid? TechnicianId { get; set; }

    public IdentityUser Technician { get; set; }
    
    public Guid ServicePlanId { get; set; }
    
    public ServicePlan ServicePlan { get; set; }

    public List<TicketComment> TicketComments { get; set; }
    
    public string Subject { get; set; }
    
    public string Description { get; set; }
    
    public TicketPriority? Priority { get; set; }
    
    public TicketStatus Status { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.Now.Date;
    
    public DateTime? ResolvedAt { get; set; }

    public SupportTicket(Guid id, Guid appUserId, Guid servicePlanId, string subject, string description) : base(id)
    {
        Id = id;
        AppUserId = appUserId;
        ServicePlanId = servicePlanId;
        Subject = subject;
        Description = description;
        Status = TicketStatus.Open;
        CreatedAt = DateTime.Now.Date;

        TicketComments = new List<TicketComment>();
    }


    public SupportTicket()
    {
        
    }
    
    
}