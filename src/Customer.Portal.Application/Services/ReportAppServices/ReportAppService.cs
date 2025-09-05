using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Customer.Portal.DTOs;
using Customer.Portal.DTOs.ReportDTOs;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Customer.Portal.FeaturesManagers.MReport;
using Customer.Portal.FeaturesManagers.MSupportTicket;
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
    private readonly ISupportTicketManager _supportTicketManager;

    #endregion

    #region Ctor

    public ReportAppService(IReportManager reportManager, ICurrentUser currentUser, ISupportTicketManager supportTicketManager)
    {
        _reportManager = reportManager;
        _currentUser = currentUser;
        _supportTicketManager = supportTicketManager;
    }

    #endregion

    #region Methods

    public async Task<IActionResult> GenerateReportAsync(ReportTypes reportType, Guid? ticketId, DateTime? startDate, DateTime? endDate, string? workPerformed)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("Current user is not logged in.");
        
        Guid ticketIdValue = ticketId ?? Guid.Empty;
        byte[] pdfBytes;
        string fileName;
    
        if (reportType == ReportTypes.TechnicianReport)
        { 
            pdfBytes = await _reportManager.GenerateTechnicianReportAsync(reportType, ticketIdValue, identityUserId, workPerformed);
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
        else if (reportType == ReportTypes.SummaryReport)
        {
            if (!startDate.HasValue || !endDate.HasValue)
            {
                throw new UserFriendlyException("Start date and end date must be provided for Summary Report.");
            }
            
            pdfBytes = await _reportManager.GenerateSummaryReportAsync(reportType, startDate.Value, endDate.Value);
            fileName = $"SummaryReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
        }
        else
        {
            throw new UserFriendlyException("Invalid report type.");
        }
        
        return new FileContentResult(pdfBytes, "application/pdf")
        {
            FileDownloadName = fileName
        };
    }
    

    public async Task<IActionResult> GenerateSupportAgentTicketReportAsync(Guid ticketId)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        // Generate the report
        var pdfBytes = await _reportManager.GenerateSupportAgentReportAsync(ReportTypes.SupportAgentTicketReport, ticketId, identityUserId);
        
        // Mark the ticket as resolved since report generation means work is complete
        if (ticketId != Guid.Empty)
        {
            await _supportTicketManager.UpdateTicketStatusAsync(ticketId, TicketStatus.Resolved);
        }
        
        var fileName = $"SupportAgentTicketReport_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        
        return new FileContentResult(pdfBytes, "application/pdf")
        {
            FileDownloadName = fileName
        };
    }
    
    public async Task<IActionResult> GenerateSupportAgentWithTechnicianReportAsync(Guid ticketId)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        // Generate the report
        var pdfBytes = await _reportManager.GenerateSupportAgentWithTechnicianReportAsync(ReportTypes.SupportAgentWithTechnicianReport, ticketId, identityUserId);
        
        // Mark the ticket as resolved since report generation means work is complete
        if (ticketId != Guid.Empty)
        {
            await _supportTicketManager.UpdateTicketStatusAsync(ticketId, TicketStatus.Resolved);
        }
        
        var fileName = $"SupportAgentWithTechnicianReport_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        
        return new FileContentResult(pdfBytes, "application/pdf")
        {
            FileDownloadName = fileName
        };
    }
    

    public async Task<IActionResult> GenerateTechnicianReportAsync(Guid ticketId, string workPerformed)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        var pdfBytes = await _reportManager.GenerateTechnicianReportAsync(ReportTypes.TechnicianReport, ticketId, identityUserId, workPerformed);
        var fileName = $"TechnicianReport_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        
        return new FileContentResult(pdfBytes, "application/pdf")
        {
            FileDownloadName = fileName
        };
    }
    

    public async Task<IActionResult> GenerateSummaryReportAsync(DateTime startDate, DateTime endDate)
    {
        var pdfBytes = await _reportManager.GenerateSummaryReportAsync(ReportTypes.SummaryReport, startDate, endDate);
        var fileName = $"SummaryReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
        
        return new FileContentResult(pdfBytes, "application/pdf")
        {
            FileDownloadName = fileName
        };
    }

    #endregion
    
}