using System;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.EmailDTOs;

public class EmailDto : FullAuditedEntityDto<Guid>
{
    public Guid IdentityUserId { get; set; }
    public string IdentityUserName { get; set; }
    
    public Guid EmailTemplateId { get; set; }
    public string EmailTemplateName { get; set; }

    public string EmailAddress { get; set; }

    public string Subject { get; set; }

    public string Body { get; set; }

    public DateTime SentAt { get; set; }

    public bool IsSuccess { get; set; }

    public string ErrorMessage { get; set; }
}