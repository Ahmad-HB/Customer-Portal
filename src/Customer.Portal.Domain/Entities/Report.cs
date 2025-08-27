using System;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Entities.Auditing;

namespace Customer.Portal.Entities;

public class Report : FullAuditedEntity<Guid>
{
    public Guid ReportTemplateId { get; set; }
    
    public ReportTemplate ReportTemplate { get; set; }
    
    public string Subject { get; set; }
    
    public string Content { get; set; }
    
    public DateTime GeneratedAt { get; set; }

    public Report(Guid id, Guid reportTemplateId, string subject, string content, DateTime generatedAt) : base(id)
    {
        ReportTemplateId = reportTemplateId;
        Subject = subject;
        Content = content;
        GeneratedAt = generatedAt;
    }
}