using System;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Identity;

namespace Customer.Portal.Entities;

public class UserTickets : BasicAggregateRoot<Guid>
{
    public Guid IdentityUserId { get; set; }

    public IdentityUser IdentityUser { get; set; }

    public Guid SupportTicketId { get; set; }

    public SupportTicket SupportTicket { get; set; }

    // public bool IsResolved { get; set; }
}