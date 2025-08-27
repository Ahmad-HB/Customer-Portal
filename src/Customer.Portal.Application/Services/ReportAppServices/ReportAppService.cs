using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Customer.Portal.DTOs;
using Customer.Portal.DTOs.ReportDTOs;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Customer.Portal.FeaturesManagers.MReport;
using Microsoft.AspNetCore.Mvc;

using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Users;

namespace Customer.Portal.Services.ReportAppServices;

public class ReportAppService : PortalAppService, IReportAppService
{

    #region Fields

    private readonly IReportManager _reportManager;
    private readonly ICurrentUser _currentUser;

    #endregion

    #region Ctor

    public ReportAppService(IReportManager reportManager, ICurrentUser currentUser)
    {
        _reportManager = reportManager;
        _currentUser = currentUser;
    }

    #endregion

    #region Methods

    public async Task<IActionResult> GenerateReportAsync(ReportTypes reportType, Guid? ticketId, DateTime? startDate, DateTime? endDate)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("Current user is not logged in.");
        
        Guid ticketIdValue = ticketId ?? Guid.Empty;
        byte[] pdfBytes;
        string fileName;
    
        if (reportType == ReportTypes.TechnicianReport)
        { 
            pdfBytes = await _reportManager.GenerateTechnicianReportAsync(reportType, ticketIdValue, identityUserId);
            fileName = $"TechnicianReport_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        }
        else if (reportType == ReportTypes.SupportAgentTicketReport)
        {
            pdfBytes = await _reportManager.GenerateSupportAgentReportAsync(reportType, ticketIdValue, identityUserId);
            fileName = $"SupportAgentReport_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        }
        else if (reportType == ReportTypes.SupportAgentWithTechnicianReport)
        {
            pdfBytes = await _reportManager.GenerateSupportAgentWithTechnicianReportAsync(reportType, ticketIdValue, identityUserId);
            fileName = $"SupportAgentWithTechnicianReport_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        }
        else if (reportType == ReportTypes.MonthlySummaryReport)
        {
            if (!startDate.HasValue || !endDate.HasValue)
            {
                throw new UserFriendlyException("Start date and end date must be provided for Monthly Summary Report.");
            }
            
            pdfBytes = await _reportManager.GenerateMonthlySummaryReportAsync(reportType, startDate.Value, endDate.Value);
            fileName = $"MonthlySummaryReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
        }
        else
        {
            throw new UserFriendlyException("Invalid report type.");
        }
        
        var stream = new MemoryStream(pdfBytes);
        return new FileStreamResult(stream, "application/pdf")
        {
            FileDownloadName = fileName
        };
    }
    

    #endregion
    
}