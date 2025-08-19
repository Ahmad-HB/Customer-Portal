using System;
using System.Collections.Generic;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.SupportTicketDTOs;

public class SupportTicketDto : FullAuditedEntityDto<Guid>
{
    public Guid AppUserId { get; set; }
    public string AppUserName { get; set; }
    
    public Guid? SupportagentId { get; set; }
    public string SupportagentName { get; set; }

    public Guid? TechnicianId { get; set; }
    public string IdentityUserName { get; set; }
    
    public Guid ServicePlanId { get; set; }
    public string ServicePlanName { get; set; }

    public List<TicketComment> TicketComments { get; set; }
    
    public string Subject { get; set; }
    
    public string Description { get; set; }
    
    public TicketPriority Priority { get; set; }
    
    public TicketStatus Status { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? ResolvedAt { get; set; }
}