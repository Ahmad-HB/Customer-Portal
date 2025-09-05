using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Microsoft.Extensions.Logging;
using PuppeteerSharp;
using PuppeteerSharp.Media;
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
        
        // Get the specific ticket
        var supportTicket = await _supportTicketRepository.FirstOrDefaultAsync(st => st.Id == ticketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException($"No support ticket found with ID: {ticketId}");
        }
        
        // Get the support agent info (current logged in user)
        var supportAgent = await _appUserRepository.FirstOrDefaultAsync(au => au.IdentityUserId == identityUserId);
        if (supportAgent == null)
        {
            throw new UserFriendlyException("Support agent not found");
        }
        
        // Get customer info
        var customer = await _appUserRepository.FirstOrDefaultAsync(au => au.Id == supportTicket.AppUserId);
        
        // Get technician info (if assigned)
        var technician = await _appUserRepository.FirstOrDefaultAsync(au => au.Id == supportTicket.TechnicianId);
        
        
        var templateData = new Dictionary<string, object>
        {
            ["CustomerName"] = customer?.Name ?? "N/A",
            ["SupportAgentName"] = supportAgent?.Name ?? "N/A",
            ["TechnicianName"] = technician?.Name ?? "N/A",
            ["TicketId"] = supportTicket.Id,
            ["TicketSubject"] = supportTicket.Subject,
            ["IssueDescription"] = supportTicket.Description,
            ["Status"] = supportTicket.Status.ToString(),
            ["Priority"] = supportTicket.Priority.ToString(),
            ["CreatedAt"] = supportTicket.CreatedAt.ToString("yyyy-MM-dd"),
            ["ResolvedAt"] = supportTicket.ResolvedAt?.ToString("yyyy-MM-dd"),
            ["date"] = new Dictionary<string, object>
            {
                ["now"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            }
        };
        
        // Log template data for debugging
        _logger.LogInformation("Template data: SupportAgentName={SupportAgentName}, TicketId={TicketId}, CustomerName={CustomerName}",
            templateData["SupportAgentName"], templateData["TicketId"], templateData["CustomerName"]);

        // Use Scriban to render the template from database
        var template = Template.Parse(reportTemplate.Format);
        if (template.HasErrors)
        {
            _logger.LogError("Template parsing errors: {Errors}",
                string.Join(", ", template.Messages.Select(m => m.Message)));
            throw new UserFriendlyException("Report template has parsing errors");
        }

        var reportContent = template.Render(templateData);
        
        if (string.IsNullOrEmpty(reportContent))
        {
            _logger.LogError("Rendered report content is empty");
            throw new UserFriendlyException("Report template rendering resulted in empty content");
        }
        
        
        var report = new Report(
            _guidGenerator.Create(),
            reportTemplate.Id,
            reportTemplate.Name,
            reportContent,
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
        
        // Get the specific ticket
        var supportTicket = await _supportTicketRepository.FirstOrDefaultAsync(st => st.Id == ticketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException($"No support ticket found with ID: {ticketId}");
        }
        
        // Get the support agent info (current logged in user)
        var supportAgent = await _appUserRepository.FirstOrDefaultAsync(au => au.IdentityUserId == identityUserId);
        if (supportAgent == null)
        {
            throw new UserFriendlyException("Support agent not found");
        }
        
        // Get customer info
        var customer = await _appUserRepository.FirstOrDefaultAsync(au => au.Id == supportTicket.AppUserId);
        
        // Get technician info (if assigned)
        var technicianId = supportTicket.TechnicianId;
        var technician = await _identityUserRepository.FirstOrDefaultAsync(au => au.Id == technicianId);
            
            
        
        var templateData = new Dictionary<string, object>
        {
            ["CustomerName"] = customer?.Name ?? "N/A",
            ["SupportAgentName"] = supportAgent?.Name ?? "N/A",
            ["TechnicianName"] = technician?.Name ?? "N/A",
            ["TicketId"] = supportTicket.Id,
            ["TicketSubject"] = supportTicket.Subject,
            ["IssueDescription"] = supportTicket.Description,
            ["Status"] = supportTicket.Status.ToString(),
            ["Priority"] = supportTicket.Priority.ToString(),
            ["CreatedAt"] = supportTicket.CreatedAt.ToString("yyyy-MM-dd"),
            ["ResolvedAt"] = supportTicket.ResolvedAt?.ToString("yyyy-MM-dd"),
            ["date"] = new Dictionary<string, object>
            {
                ["now"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            }
        };
        
        // Log template data for debugging
        _logger.LogInformation("Template data: SupportAgentName={SupportAgentName}, TechnicianName={TechnicianName}, TicketId={TicketId}, CustomerName={CustomerName}",
            templateData["SupportAgentName"], templateData["TechnicianName"], templateData["TicketId"], templateData["CustomerName"]);

        // Use Scriban to render the template from database
        var template = Template.Parse(reportTemplate.Format);
        if (template.HasErrors)
        {
            _logger.LogError("Template parsing errors: {Errors}",
                string.Join(", ", template.Messages.Select(m => m.Message)));
            throw new UserFriendlyException("Report template has parsing errors");
        }

        var reportContent = template.Render(templateData);
        
        if (string.IsNullOrEmpty(reportContent))
        {
            _logger.LogError("Rendered report content is empty");
            throw new UserFriendlyException("Report template rendering resulted in empty content");
        }
        
        var report = new Report(
            _guidGenerator.Create(),
            reportTemplate.Id,
            reportTemplate.Name,
            reportContent,
            DateTime.UtcNow
        );
        await _reportRepository.InsertAsync(report);
        
        var pdf = await GeneratePdfReportAsync(report);
        return pdf;
    }

    public async Task<Byte[]> GenerateTechnicianReportAsync(ReportTypes reportType, Guid ticketId, Guid identityUserId, string workPerformed)
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
        
        var templateData = new Dictionary<string, object>
        {
            ["CustomerName"] = customer?.Name ?? "N/A",
            ["TechnicianName"] = technician?.Name ?? "N/A",
            ["TicketId"] = supportTicket.Id,
            ["TicketSubject"] = supportTicket.Subject,
            ["IssueDescription"] = supportTicket.Description,
            ["WorkPerformed"] = workPerformed ?? "No work performed details provided",
            ["Status"] = supportTicket.Status.ToString(),
            ["Priority"] = supportTicket.Priority?.ToString() ?? "Not Set",
            ["CreatedAt"] = supportTicket.CreatedAt.ToString("yyyy-MM-dd"),
            ["ResolvedAt"] = supportTicket.ResolvedAt?.ToString("yyyy-MM-dd"),
            ["date"] = new Dictionary<string, object>
            {
                ["now"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            }
        };
        
        // Log template data for debugging
        _logger.LogInformation("Technician report template data: TechnicianName={TechnicianName}, TicketId={TicketId}, CustomerName={CustomerName}, WorkPerformed={WorkPerformed}",
            templateData["TechnicianName"], templateData["TicketId"], templateData["CustomerName"], templateData["WorkPerformed"]);
        
        // Use Scriban to render the template from database
        var template = Template.Parse(reportTemplate.Format);
        var reportContent = template.Render(templateData);
        
        var report = new Report(
            _guidGenerator.Create(),
            reportTemplate.Id,
            reportTemplate.Name,
            reportContent,
            DateTime.UtcNow
        );
        
        await _reportRepository.InsertAsync(report);
        
        var pdf = await GeneratePdfReportAsync(report);
        return pdf;

    }

    public async Task<Byte[]> GenerateSummaryReportAsync(ReportTypes reportType, DateTime startDate, DateTime endDate)
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
        
        var templateData = new Dictionary<string, object>
        {
            ["start_date"] = startDate.ToString("yyyy-MM-dd"),
            ["end_date"] = endDate.ToString("yyyy-MM-dd"),
            ["total_tickets"] = totalTickets.Count,
            ["resolved_tickets"] = resolvedTickets,
            ["in_progress_tickets"] = inProgressTickets,
            ["closed_tickets"] = closedTickets,
            ["date"] = new Dictionary<string, object>
            {
                ["now"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            }
        };
        
        // Use Scriban to render the template from database
        var template = Template.Parse(reportTemplate.Format);
        var reportContent = template.Render(templateData);
        
        var report = new Report(
            _guidGenerator.Create(),
            reportTemplate.Id,
            reportTemplate.Name,
            reportContent,
            DateTime.UtcNow
        );
        
        await _reportRepository.InsertAsync(report);

        await _unitOfWork.SaveChangesAsync();
        
        var pdf = await GeneratePdfReportAsync(report);
        return pdf;
        
    }
    
    private async Task<Byte[]> GeneratePdfReportAsync(Report report)
    {
        try
        {
            // Check if the content contains HTML
            var isHtmlContent = report.Content.Contains("<html") || report.Content.Contains("<!DOCTYPE");
            
            if (isHtmlContent)
            {
                // Use HTML rendering for HTML content
                return await GeneratePdfFromHtmlAsync(report);
            }
            else
            {
                // Use traditional rendering for plain text/markdown content
                return await GeneratePdfFromTextAsync(report);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating PDF for report ID: {ReportId}", report.Id);
            throw new UserFriendlyException("An error occurred while generating the PDF report.");
        }
    }

    private async Task<byte[]> GeneratePdfFromHtmlAsync(Report report)
    {
        try
        {
            // Use PuppeteerSharp to convert HTML to PDF
            await new BrowserFetcher().DownloadAsync();
            
            using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
            });
            
            using var page = await browser.NewPageAsync();
            
            // Set viewport for consistent rendering
            await page.SetViewportAsync(new ViewPortOptions
            {
                Width = 1200,
                Height = 800,
                DeviceScaleFactor = 2
            });
            
            // Set the HTML content
            await page.SetContentAsync(report.Content, new NavigationOptions
            {
                WaitUntil = new[] { WaitUntilNavigation.Networkidle0 }
            });
            
            // Wait for any dynamic content to load and fonts to render
            await Task.Delay(2000);
            
            // Generate PDF to temporary file with optimized settings
            var tempPdfPath = Path.GetTempFileName() + ".pdf";
            await page.PdfAsync(tempPdfPath, new PdfOptions
            {
                Format = PuppeteerSharp.Media.PaperFormat.A4,
                PrintBackground = true,
                MarginOptions = new PuppeteerSharp.Media.MarginOptions
                {
                    Top = "0.5in",
                    Right = "0.5in",
                    Bottom = "0.5in",
                    Left = "0.5in"
                },
                PreferCSSPageSize = true,
                DisplayHeaderFooter = false
            });
            var pdfBytes = await File.ReadAllBytesAsync(tempPdfPath);
            File.Delete(tempPdfPath);
            
            return pdfBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating PDF from HTML for report ID: {ReportId}", report.Id);
            // Fallback to text rendering if HTML fails
            return await GeneratePdfFromTextAsync(report);
        }
    }
    
    // private async Task<byte[]> GeneratePdfFromHtmlAsync(Report report)
    // {
    //     try
    //     {
    //         // Use PuppeteerSharp to convert HTML to PDF
    //         await new BrowserFetcher().DownloadAsync();
    //     
    //         using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
    //         {
    //             Headless = true,
    //             Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
    //         });
    //     
    //         using var page = await browser.NewPageAsync();
    //     
    //         // Set viewport for consistent rendering
    //         await page.SetViewportAsync(new ViewPortOptions
    //         {
    //             Width = 1200,
    //             Height = 800,
    //             DeviceScaleFactor = 2
    //         });
    //     
    //         // Set the HTML content
    //         await page.SetContentAsync(report.Content, new NavigationOptions
    //         {
    //             WaitUntil = new[] { WaitUntilNavigation.Networkidle0 }
    //         });
    //     
    //         // Wait for charts to render (add additional wait time for JavaScript execution)
    //         // await page.wait(3000);
    //         await Task.Delay(2000); // Wait for any dynamic content to load and fonts to render
    //         
    //         // Generate PDF to temporary file with optimized settings
    //         var tempPdfPath = Path.GetTempFileName() + ".pdf";
    //         await page.PdfAsync(tempPdfPath, new PdfOptions
    //         {
    //             Format = PaperFormat.A4,
    //             PrintBackground = true,
    //             MarginOptions = new MarginOptions
    //             {
    //                 Top = "0.5in",
    //                 Right = "0.5in",
    //                 Bottom = "0.5in",
    //                 Left = "0.5in"
    //             },
    //             PreferCSSPageSize = true,
    //             DisplayHeaderFooter = false
    //         });
    //     
    //         var pdfBytes = await File.ReadAllBytesAsync(tempPdfPath);
    //         File.Delete(tempPdfPath);
    //     
    //         return pdfBytes;
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "Error generating PDF from HTML for report ID: {ReportId}", report.Id);
    //         // Fallback to text rendering if HTML fails
    //         return await GeneratePdfFromTextAsync(report);
    //     }
    // }
    private async Task<byte[]> GeneratePdfFromTextAsync(Report report)
    {
        try
        {
            // For plain text, wrap it in a simple HTML structure
            var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>{report.Subject}</title>
    <style>
        body {{ 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 20px; 
            background-color: white;
        }}
        .header {{ 
            background-color: #007bff; 
            color: white; 
            padding: 20px; 
            text-align: center;
            margin-bottom: 20px;
        }}
        .content {{ 
            padding: 20px;
        }}
        .footer {{ 
            background-color: #6c757d; 
            color: white; 
            padding: 10px; 
            text-align: center; 
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>{report.Subject}</h1>
    </div>
    <div class='content'>
        {report.Content.Replace("\n", "<br>")}
    </div>
    <div class='footer'>
        <p>Generated on {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}</p>
    </div>
</body>
</html>";
            
            // Use the same PuppeteerSharp approach for text content
            await new BrowserFetcher().DownloadAsync();
            
            using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
            });
            
            using var page = await browser.NewPageAsync();
            
            await page.SetContentAsync(htmlContent);
            await Task.Delay(500);
            
            var tempPdfPath2 = Path.GetTempFileName() + ".pdf";
            await page.PdfAsync(tempPdfPath2);
            var pdfBytes = await File.ReadAllBytesAsync(tempPdfPath2);
            File.Delete(tempPdfPath2);
            
            return pdfBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating PDF from text for report ID: {ReportId}", report.Id);
            throw new UserFriendlyException("An error occurred while generating the PDF report.");
        }
    }

    #endregion
    
    
    
}