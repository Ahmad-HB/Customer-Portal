using System;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Entities.Auditing;

namespace Customer.Portal.Entities;

public class ReportTemplate : FullAuditedEntity<Guid>
{
    public ReportTypes ReportType { get; set; }
    
    public string Name { get; set; }
    
    public string Format { get; set; }
}