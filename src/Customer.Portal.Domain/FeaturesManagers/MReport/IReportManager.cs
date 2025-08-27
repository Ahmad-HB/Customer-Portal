using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MReport;

public interface IReportManager : IDomainService
{
    public Task GenerateSupportAgentReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId);
    
    public Task GenerateSupportAgentWithTechnicianReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId);
    
    public Task GenerateTechnicianReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId);
    
    public Task GenerateMonthlySummaryReportAsync(ReportTypes reportType, DateTime startDate, DateTime endDate);
    
    
    
}