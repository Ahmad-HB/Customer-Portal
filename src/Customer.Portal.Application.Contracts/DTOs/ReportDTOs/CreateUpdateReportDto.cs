using System;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.ReportDTOs;

public class CreateUpdateReportDto : EntityDto<Guid>
{
    public Guid ReportTemplateId { get; set; }
    
    public string Subject { get; set; }
    
    public string Content { get; set; }
    
    public DateTime GeneratedAt { get; set; }
}