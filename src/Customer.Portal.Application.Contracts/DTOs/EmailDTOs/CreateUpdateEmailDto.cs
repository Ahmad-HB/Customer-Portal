using System;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.EmailDTOs;

public class CreateUpdateEmailDto : EntityDto<Guid>
{
    public Guid IdentityUserId { get; set; }

    public string EmailAddress { get; set; }

    public string Subject { get; set; }

    public string Body { get; set; }
    
}