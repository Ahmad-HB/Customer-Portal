using System;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Entities.Auditing;

namespace Customer.Portal.Entities;

public class ReportLog : FullAuditedEntity<Guid>
{
    public Guid ReportTemplateId { get; set; }
    
    public ReportTemplate ReportTemplate { get; set; }
    
    public string Subject { get; set; }
    
    public ReportContent Content { get; set; }
    
    public DateTime GeneratedAt { get; set; }
}