using System;
using System.Collections.Generic;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.AppUserDTOs;

public class AppUserDto : FullAuditedEntityDto<Guid>
{
    public Guid IdentityUserId { get; set; }
    
    public string Name { get; set; }
    
    public string Username { get; set; }
    
    public string Email { get; set; }
    
    public string PhoneNumber { get; set; }
    
    public UserType UserType { get; set; }
    
    public string Role { get; set; }
    
    public bool IsActive { get; set; }

    public List<SupportTicket> SupportTickets { get; set; }

    public List<UserServicePlan> UserServicePlans { get; set; }
}