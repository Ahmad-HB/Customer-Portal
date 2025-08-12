using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Identity;

namespace Customer.Portal.Entities;

public class EmailLog : FullAuditedEntity<Guid>
{
    public Guid UserId { get; set; }

    public IdentityUser User { get; set; }

    public string EmailAddress { get; set; }

    public string Subject { get; set; }

    public string Body { get; set; }

    public DateTime SentAt { get; set; }

    public bool IsSuccess { get; set; }

    public string ErrorMessage { get; set; }
}