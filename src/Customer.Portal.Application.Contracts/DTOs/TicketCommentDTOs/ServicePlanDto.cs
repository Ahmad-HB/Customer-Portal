using System;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.TicketCommentDTOs;

public class ServicePlanDto : FullAuditedEntityDto<Guid>
{
    public Guid TicketId { get; set; }
    
    // public SupportTicket Ticket { get; set; }
    
    public Guid UserId { get; set; }
    
    // public IdentityUser User { get; set; }
    
    public string Comment { get; set; }
    
    public DateTime CommentedAt { get; set; }
}