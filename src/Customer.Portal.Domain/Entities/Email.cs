using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Identity;

namespace Customer.Portal.Entities;

public class Email : FullAuditedEntity<Guid>
{
    public Guid IdentityUserId { get; set; }

    public IdentityUser IdentityUser { get; set; }
    
    public Guid EmailTemplateId { get; set; }
    
    public EmailTemplate EmailTemplate { get; set; }

    public string EmailAddress { get; set; }

    public string Subject { get; set; }

    public string Body { get; set; }

    public DateTime SentAt { get; set; }

    public bool IsSuccess { get; set; }

    public string ErrorMessage { get; set; }


    public Email(Guid id, Guid identityUserId, Guid emailTemplateId, string emailAddress, string subject, string body, DateTime sentAt, bool isSuccess)
        : base(id)
    {
        IdentityUserId = identityUserId;
        EmailTemplateId = emailTemplateId;
        EmailAddress = emailAddress;
        Subject = subject;
        Body = body;
        SentAt = sentAt;
        IsSuccess = isSuccess;
    }
}