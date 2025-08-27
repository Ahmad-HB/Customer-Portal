using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Identity;

namespace Customer.Portal.Entities;

public class TicketComment : FullAuditedEntity<Guid>
{
    
    public Guid TicketId { get; set; }
    
    public SupportTicket Ticket { get; set; }
    
    public Guid UserId { get; set; }
    
    public IdentityUser User { get; set; }
    
    public string Comment { get; set; }
    
    public DateTime CommentedAt { get; set; }

    public TicketComment(Guid id, Guid ticketId, Guid userId, string comment, DateTime commentedAt) : base(id)
    {
        id = Id;
        TicketId = ticketId;
        UserId = userId;
        Comment = comment;
        CommentedAt = commentedAt;
    }

    public TicketComment(Guid id)
    {
    }
}