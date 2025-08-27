using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Scriban;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.TextTemplating;
using Volo.Abp.Uow;


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
    private readonly IUnitOfWorkManager _unitOfWorkManager;
    private readonly IUnitOfWork _unitOfWork;

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
        ILogger<ReportManager> logger, IRepository<IdentityUser, Guid> identityUserRepository, IUnitOfWorkManager unitOfWorkManager, IUnitOfWork unitOfWork)
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
        _unitOfWorkManager = unitOfWorkManager;
        _unitOfWork = unitOfWork;
    }

    #endregion

    #region Methods

    public async Task<Byte[]> GenerateSupportAgentReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId)
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
        
        var pdf = await GeneratePdfReportAsync(report);
        return pdf;
        
    }

    public async Task<Byte[]> GenerateSupportAgentWithTechnicianReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId)
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
        
        var pdf = await GeneratePdfReportAsync(report);
        return pdf;
    }

    public async Task<Byte[]> GenerateTechnicianReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId)
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
        
        var pdf = await GeneratePdfReportAsync(report);
        return pdf;

    }

    public async Task<Byte[]> GenerateMonthlySummaryReportAsync(ReportTypes reportType, DateTime startDate, DateTime endDate)
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
        
        var scribanTemplate = Template.Parse(reportTemplate.Format);
        var reportContent = scribanTemplate.Render(templateData, member => member.Name);

        
        // var reportContent = await _templateRenderer.RenderAsync(
        //     reportTemplate.Format,
        //     templateData
        // );
        
        var report = new Report(
            _guidGenerator.Create(),
            reportTemplate.Id,
            reportTemplate.Name,
            reportContent.ToString(),
            DateTime.UtcNow
        );
        
        await _reportRepository.InsertAsync(report);

        await _unitOfWork.SaveChangesAsync();
        
        var pdf = await GeneratePdfReportAsync(report);
        return pdf;
        
    }
    
    public async Task<Byte[]> GeneratePdfReportAsync(Report report)
    {
        // var report = await _reportRepository.FirstOrDefaultAsync(r => r.Id == );
        // if (report == null)
        // {
        //     throw new UserFriendlyException($"No report found with ID: {report.Id}");
        // }

        try
        {
            var pdfBytes = QuestPDF.Fluent.Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header()
                        .Text(report.Subject)
                        .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(col =>
                        {
                            foreach (var line in report.Content.Split('\n'))
                            {
                                col.Item().Text(line);
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Generated on ");
                            x.Span(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")).SemiBold();
                        });
                });
            }).GeneratePdf();

            return pdfBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating PDF for report ID: {ReportId}", report.Id);
            throw new UserFriendlyException("An error occurred while generating the PDF report.");
        }
    }

    #endregion
    
    
    
}