using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MReport;

public interface IReportManager : IDomainService
{
    public Task<Byte[]> GenerateSupportAgentReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId);
    
    public Task<Byte[]> GenerateSupportAgentWithTechnicianReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId);
    
    public Task<Byte[]> GenerateTechnicianReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId);
    
    public Task<Byte[]> GenerateMonthlySummaryReportAsync(ReportTypes reportType, DateTime startDate, DateTime endDate);
    
    
    
}