using System;
using Customer.Portal.Enums;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.ReportDTOs;

public class ReportDto : FullAuditedEntityDto<Guid>
{
    public Guid ReportTemplateId { get; set; }
    
    public TemplateType ReportTemplateTemplateType { get; set; }
    
    public ReportTypes ReportTemplateReportType { get; set; }
    
    public string ReportTemplateName { get; set; }
    
    public string Subject { get; set; }
    
    public string Content { get; set; }
    
    public DateTime GeneratedAt { get; set; }
}