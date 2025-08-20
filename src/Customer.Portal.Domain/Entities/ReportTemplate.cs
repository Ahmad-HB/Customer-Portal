using System;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Entities.Auditing;

namespace Customer.Portal.Entities;

public class ReportTemplate : FullAuditedEntity<Guid>
{
    public TemplateType TemplateType { get; set; }
    
    public ReportTypes ReportType { get; set; }
    
    public string Name { get; set; }
    
    public string Format { get; set; }


    public ReportTemplate(Guid id, TemplateType templateType, ReportTypes reportType, string name, string format) : base(id)
    {
        Id = id;
        TemplateType = templateType;
        ReportType = reportType;
        Name = name;
        Format = format;
    }
    
    // EmailTemplateConfiguration
}