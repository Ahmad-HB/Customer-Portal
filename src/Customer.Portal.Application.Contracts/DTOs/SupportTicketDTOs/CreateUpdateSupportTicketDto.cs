using System;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.SupportTicketDTOs;

public class CreateUpdateSupportTicketDto : EntityDto<Guid>
{
    // public Guid AppUserId { get; set; }
    
    public Guid ServicePlanId { get; set; }
    
    public string Subject { get; set; }
    
    public string Description { get; set; }
    
}