using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.TextTemplating;

namespace Customer.Portal.FeaturesManagers.MReport;

public class ReportManager : DomainService, IReportManager
{
    #region Fields

    private readonly IRepository<Report, Guid> _reportRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IRepository<ReportTemplate, Guid> _reportTemplateRepository;
    private readonly IRepository<SupportTicket, Guid> _supportTicketRepository;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IRepository<Email, Guid> _emailRepository;
    private readonly ITemplateRenderer _templateRenderer;
    private readonly IGuidGenerator _guidGenerator;
    private readonly ILogger<ReportManager> _logger;

    #endregion

    #region Constructor

    public ReportManager(
        IRepository<Report, Guid> reportRepository,
        IRepository<ReportTemplate, Guid> reportTemplateRepository,
        IRepository<SupportTicket, Guid> supportTicketRepository,
        IRepository<AppUser, Guid> appUserRepository,
        IRepository<Email, Guid> emailRepository,
        ITemplateRenderer templateRenderer,
        IGuidGenerator guidGenerator,
        ILogger<ReportManager> logger, IRepository<IdentityUser, Guid> identityUserRepository)
    {
        _reportRepository = reportRepository;
        _reportTemplateRepository = reportTemplateRepository;
        _supportTicketRepository = supportTicketRepository;
        _appUserRepository = appUserRepository;
        _emailRepository = emailRepository;
        _templateRenderer = templateRenderer;
        _guidGenerator = guidGenerator;
        _logger = logger;
        _identityUserRepository = identityUserRepository;
    }

    #endregion

    #region Methods

    public async Task GenerateSupportAgentReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId)
    {
        var reportTemplate = await _reportTemplateRepository.FirstOrDefaultAsync(rt => rt.ReportType == reportType);
        if (reportTemplate == null)
        {
            throw new UserFriendlyException($"No report template found for report type: {reportType}");
        }
        
        var supportTicket = await _supportTicketRepository.FirstOrDefaultAsync(st => st.Id == ticketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException($"No support ticket found with ID: {ticketId}");
        }
        
        var supportAgent = await _appUserRepository.FirstOrDefaultAsync(au => au.IdentityUserId == identityUserId);
        
        var customer = await _appUserRepository.FirstOrDefaultAsync(au => au.Id == supportTicket.AppUserId);
        
        var technician = await _identityUserRepository.FirstOrDefaultAsync(au => au.Id == supportTicket.TechnicianId);
        
        
        var templateData = new
        {
            CustomerName = customer?.Name ?? "N/A",
            SupportAgentName = supportAgent?.Name ?? "N/A",
            TicketId = supportTicket.Id,
            IssueDescription = supportTicket.Description,
            Status = supportTicket.Status.ToString(),
            CreatedAt = supportTicket.CreatedAt.ToString("yyyy-MM-dd"),
            ResolvedAt = supportTicket.ResolvedAt?.ToString("yyyy-MM-dd")
        };
        
        var reportContent = await _templateRenderer.RenderAsync(
            reportTemplate.Format,
            templateData
        );
        
        
        var report = new Report(
            _guidGenerator.Create(),
            reportTemplate.Id,
            reportTemplate.Name,
            reportContent.ToString(),
            DateTime.UtcNow
        );
        await _reportRepository.InsertAsync(report);
        
    }

    public async Task GenerateSupportAgentWithTechnicianReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId)
    {
        var reportTemplate = await _reportTemplateRepository.FirstOrDefaultAsync(rt => rt.ReportType == reportType);
        if (reportTemplate == null)
        {
            throw new UserFriendlyException($"No report template found for report type: {reportType}");
        }
        
        var supportTicket = await _supportTicketRepository.FirstOrDefaultAsync(st => st.Id == ticketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException($"No support ticket found with ID: {ticketId}");
        }
        
        var supportAgent = await _appUserRepository.FirstOrDefaultAsync(au => au.IdentityUserId == identityUserId);
        
        var customer = await _appUserRepository.FirstOrDefaultAsync(au => au.Id == supportTicket.AppUserId);
        
        var technician = await _identityUserRepository.FirstOrDefaultAsync(au => au.Id == supportTicket.TechnicianId);
        
        var templateData = new
        {
            CustomerName = customer?.Name ?? "N/A",
            SupportAgentName = supportAgent?.Name ?? "N/A",
            TechnicianName = technician?.UserName ?? "N/A",
            TicketId = supportTicket.Id,
            IssueDescription = supportTicket.Description,
            Status = supportTicket.Status.ToString(),
            CreatedAt = supportTicket.CreatedAt.ToString("yyyy-MM-dd"),
            ResolvedAt = supportTicket.ResolvedAt?.ToString("yyyy-MM-dd")
        };
        
        var reportContent = await _templateRenderer.RenderAsync(
            reportTemplate.Format,
            templateData
        );
        
        var report = new Report(
            _guidGenerator.Create(),
            reportTemplate.Id,
            reportTemplate.Name,
            reportContent.ToString(),
            DateTime.UtcNow
        );
        await _reportRepository.InsertAsync(report);
    }

    public async Task GenerateTechnicianReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId)
    {
        var reportTemplate = await _reportTemplateRepository.FirstOrDefaultAsync(rt => rt.ReportType == reportType);
        if (reportTemplate == null)
        {
            throw new UserFriendlyException($"No report template found for report type: {reportType}");
        }
        
        var supportTicket = await _supportTicketRepository.FirstOrDefaultAsync(st => st.Id == ticketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException($"No support ticket found with ID: {ticketId}");
        }
        
        var technician = await _appUserRepository.FirstOrDefaultAsync(au => au.IdentityUserId == identityUserId);
        
        var customer = await _appUserRepository.FirstOrDefaultAsync(au => au.Id == supportTicket.AppUserId);
        
        var templateData = new
        {
            CustomerName = customer?.Name ?? "N/A",
            TechnicianName = technician?.Name ?? "N/A",
            TicketId = supportTicket.Id,
            IssueDescription = supportTicket.Description,
            Status = supportTicket.Status.ToString(),
            CreatedAt = supportTicket.CreatedAt.ToString("yyyy-MM-dd"),
            ResolvedAt = supportTicket.ResolvedAt?.ToString("yyyy-MM-dd")
        };
        
        var reportContent = await _templateRenderer.RenderAsync(
            reportTemplate.Format,
            templateData
        );
        
        var report = new Report(
            _guidGenerator.Create(),
            reportTemplate.Id,
            reportTemplate.Name,
            reportContent.ToString(),
            DateTime.UtcNow
        );
        
        await _reportRepository.InsertAsync(report);

    }

    public async Task GenerateMonthlySummaryReportAsync(ReportTypes reportType, DateTime startDate, DateTime endDate)
    {
        var reportTemplate = await _reportTemplateRepository.FirstOrDefaultAsync(rt => rt.ReportType == reportType);
        if (reportTemplate == null)
        {
            throw new UserFriendlyException($"No report template found for report type: {reportType}");
        }
        
        var totalTickets = await _supportTicketRepository.GetListAsync(st => st.CreatedAt >= startDate && st.CreatedAt <= endDate);
        var resolvedTickets = totalTickets.Count(st => st.Status == TicketStatus.Resolved);
        var inProgressTickets = totalTickets.Count(st => st.Status == TicketStatus.InProgress);
        var closedTickets = totalTickets.Count(st => st.Status == TicketStatus.Closed);
        
        var templateData = new
        {
            StartDate = startDate.ToString("yyyy-MM-dd"),
            EndDate = endDate.ToString("yyyy-MM-dd"),
            TotalTickets = totalTickets.Count,
            ResolvedTickets = resolvedTickets,
            InProgressTickets = inProgressTickets,
            ClosedTickets = closedTickets
        };
        
        var reportContent = await _templateRenderer.RenderAsync(
            reportTemplate.Format,
            templateData
        );
        
        var report = new Report(
            _guidGenerator.Create(),
            reportTemplate.Id,
            reportTemplate.Name,
            reportContent.ToString(),
            DateTime.UtcNow
        );
        
        await _reportRepository.InsertAsync(report);
        
    }

    #endregion
    
}