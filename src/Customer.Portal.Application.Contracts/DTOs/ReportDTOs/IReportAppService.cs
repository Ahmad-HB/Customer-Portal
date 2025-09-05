using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Customer.Portal.Enums;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Customer.Portal.DTOs.ReportDTOs;

public interface IReportAppService : IApplicationService
{
    public Task<IActionResult> GenerateReportAsync(ReportTypes reportType, Guid? ticketId, DateTime? startDate, DateTime? endDate, string? workPerformed);
    

    public Task<IActionResult> GenerateSupportAgentTicketReportAsync(Guid ticketId);
    
    public Task<IActionResult> GenerateSupportAgentWithTechnicianReportAsync(Guid ticketId);

    public Task<IActionResult> GenerateTechnicianReportAsync(Guid ticketId, string workPerformed);
    

    public Task<IActionResult> GenerateSummaryReportAsync(DateTime startDate, DateTime endDate);
}