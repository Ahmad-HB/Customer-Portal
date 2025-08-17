using System;
using System.Collections.Generic;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Identity;

namespace Customer.Portal.Entities;

public class AppUser : FullAuditedEntity<Guid>
{
    public UserType UserType { get; set; }
    
    public string Name { get; set; }
    
    public string Email { get; set; }
    
    public string PhoneNumber { get; set; }
    
    public bool IsActive { get; set; }
    
    public Guid IdentityUserId { get; set; }

    public IdentityUser IdentityUser { get; set; }

    public List<SupportTicket> SupportTickets { get; set; }

    public List<UserServicePlan> UserServicePlans { get; set; }
    
    
}