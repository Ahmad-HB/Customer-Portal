using System;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Entities.Auditing;

namespace Customer.Portal.Entities;

public class EmailTemplate : FullAuditedEntity<Guid>
{
    public TemplateType TemplateType { get; set; }
    
    public EmailType EmailType { get; set; }
    
    public string Name { get; set; }
    
    public string Format { get; set; }

    public EmailTemplate(Guid id, EmailType emailType, TemplateType templateType, string name, string format) : base(id)
    {
        TemplateType = templateType;
        EmailType = emailType;
        Name = name;
        Format = format;
    }
}