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
}