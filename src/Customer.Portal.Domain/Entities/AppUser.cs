using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Identity;

namespace Customer.Portal.Entities;

public class AppUser : FullAuditedEntity<Guid>
{
    public UserType UserType { get; set; }
    
    public string Name { get; set; }

    public string UserName { get; set; }
    
    public string Email { get; set; }
    
    public string PhoneNumber { get; set; }
    
    public bool IsActive { get; set; }
    
    public Guid IdentityUserId { get; set; }

    public IdentityUser IdentityUser { get; set; }

    public List<SupportTicket> SupportTickets { get; set; }

    public List<UserServicePlan> UserServicePlans { get; set; }


    public AppUser(Guid id, string name, string userName, string email, string phoneNumber, bool isActive, UserType userType, Guid identityUserId) : base(id)
    {
        Id = id;
        Name = name;
        UserName = userName;
        Email = email;
        PhoneNumber = phoneNumber;
        IsActive = isActive;
        UserType = userType;
        IdentityUserId = identityUserId;

        SupportTickets = new List<SupportTicket>();
        UserServicePlans = new List<UserServicePlan>();
    }
    
    
}