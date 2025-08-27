using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.DTOs.ReportDTOs;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Customer.Portal.FeaturesManagers.MReport;
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

    public async Task GenerateReportAsync(ReportTypes reportType, Guid ticketId, DateTime? startDate, DateTime? endDate)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("Current user is not logged in.");

        if (reportType == ReportTypes.TechnicianReport)
        {
          await  _reportManager.GenerateTechnicianReportAsync(reportType ,ticketId, identityUserId);
          
        }
        else if (reportType == ReportTypes.SupportAgentTicketReport)
        {
            await _reportManager.GenerateSupportAgentReportAsync(reportType, ticketId, identityUserId);
        }
        else if (reportType == ReportTypes.SupportAgentWithTechnicianReport)
        {
            await _reportManager.GenerateSupportAgentWithTechnicianReportAsync(reportType, ticketId, identityUserId);
        }
        else if (reportType == ReportTypes.MonthlySummaryReport)
        {
            
            if (!startDate.HasValue || !endDate.HasValue)
            {
                throw new UserFriendlyException("Start date and end date must be provided for Monthly Summary Report.");
            }
            
            await _reportManager.GenerateMonthlySummaryReportAsync(reportType, startDate.Value, endDate.Value);
            
        }
        else
        {
            throw new UserFriendlyException("Invalid report type.");
        }
        
    }

    #endregion
    
}