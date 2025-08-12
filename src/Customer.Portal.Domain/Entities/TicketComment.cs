using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Identity;

namespace Customer.Portal.Entities;

public class TicketComment : FullAuditedEntity<Guid>
{
    
    public Guid TicketId { get; set; }
    
    public SupportTicket Ticket { get; set; }
    
    public string Comment { get; set; }
    
    public Guid UserId { get; set; }
    
    public IdentityUser User { get; set; }
    
    public DateTime CommentedAt { get; set; }
    
}