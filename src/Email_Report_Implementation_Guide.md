# Email & Report System Implementation Guide

## Overview

This guide outlines the implementation of two separate systems:
1. **Email System**: Automatic email notifications triggered by domain events (no API endpoints)
2. **Report System**: PDF report generation with database-stored templates

## System Architecture

### Email System
- **Trigger**: Domain events (ticket updates, user registration, etc.)
- **Templates**: Fixed database templates (no user control)
- **Delivery**: Direct email sending via ABP IEmailSender
- **API**: None (internal system only)

### Report System
- **Trigger**: Manual generation by users (technicians, admins, support agents)
- **Templates**: Fixed database templates (no user control)
- **Output**: PDF files
- **API**: Available for report generation and download

## Step 1: Database Schema Design

### Email Templates Table
```sql
CREATE TABLE EmailTemplates (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Subject NVARCHAR(500) NOT NULL,
    Body NVARCHAR(MAX) NOT NULL,
    EmailType INT NOT NULL, -- Enum: TicketCreated, TicketUpdated, etc.
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### Report Templates Table
```sql
CREATE TABLE ReportTemplates (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(500),
    TemplateContent NVARCHAR(MAX) NOT NULL,
    ReportType INT NOT NULL, -- Enum: TechnicianReport, AdminSummary, SupportAgentReport
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### Generated Reports Table
```sql
CREATE TABLE GeneratedReports (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ReportTemplateId UNIQUEIDENTIFIER NOT NULL,
    GeneratedBy UNIQUEIDENTIFIER NOT NULL, -- User ID
    ReportName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(500), -- Path to stored PDF
    FileSize BIGINT,
    GeneratedAt DATETIME2 DEFAULT GETUTCDATE(),
    Parameters NVARCHAR(MAX), -- JSON parameters used for generation
    FOREIGN KEY (ReportTemplateId) REFERENCES ReportTemplates(Id)
);
```

## Step 2: Domain Layer Implementation

### 2.1 Enums

**EmailType.cs**
```csharp
public enum EmailType
{
    TicketCreated = 1,
    TicketUpdated = 2,
    TicketAssigned = 3,
    TicketClosed = 4,
    TicketReopened = 5,
    UserRegistration = 6,
    TicketEscalated = 7,
    TicketResolved = 8
}
```

**ReportType.cs**
```csharp
public enum ReportType
{
    TechnicianReport = 1,
    AdminMonthlySummary = 2,
    SupportAgentReport = 3,
    SupportAgentReportWithTechnician = 4
}
```

### 2.2 Domain Entities

**EmailTemplate.cs**
```csharp
public class EmailTemplate : FullAuditedEntity<Guid>
{
    public string Name { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
    public EmailType EmailType { get; set; }
    public bool IsActive { get; set; }
}
```

**ReportTemplate.cs**
```csharp
public class ReportTemplate : FullAuditedEntity<Guid>
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string TemplateContent { get; set; }
    public ReportType ReportType { get; set; }
    public bool IsActive { get; set; }
}
```

**GeneratedReport.cs**
```csharp
public class GeneratedReport : FullAuditedEntity<Guid>
{
    public Guid ReportTemplateId { get; set; }
    public ReportTemplate ReportTemplate { get; set; }
    public Guid GeneratedBy { get; set; }
    public string ReportName { get; set; }
    public string FilePath { get; set; }
    public long? FileSize { get; set; }
    public DateTime GeneratedAt { get; set; }
    public string Parameters { get; set; } // JSON string
}
```

### 2.3 Domain Services

**IEmailService.cs**
```csharp
public interface IEmailService : IDomainService
{
    Task SendTicketCreatedEmailAsync(SupportTicket ticket);
    Task SendTicketUpdatedEmailAsync(SupportTicket ticket, string updateType);
    Task SendTicketAssignedEmailAsync(SupportTicket ticket, Guid technicianId);
    Task SendTicketClosedEmailAsync(SupportTicket ticket);
    Task SendUserRegistrationEmailAsync(AppUser user);
    Task SendTicketEscalatedEmailAsync(SupportTicket ticket);
    Task SendTicketResolvedEmailAsync(SupportTicket ticket);
}
```

**IReportService.cs**
```csharp
public interface IReportService : IDomainService
{
    Task<GeneratedReport> GenerateTechnicianReportAsync(Guid technicianId, DateTime startDate, DateTime endDate);
    Task<GeneratedReport> GenerateAdminMonthlySummaryAsync(int year, int month);
    Task<GeneratedReport> GenerateSupportAgentReportAsync(Guid supportAgentId, DateTime startDate, DateTime endDate, bool involvedTechnician);
    Task<byte[]> GetReportPdfAsync(Guid reportId);
    Task<List<GeneratedReport>> GetUserReportsAsync(Guid userId, int skipCount = 0, int maxResultCount = 10);
}
```

## Step 3: Application Layer Implementation

### 3.1 DTOs

**ReportGenerationDto.cs**
```csharp
public class ReportGenerationDto
{
    public ReportType ReportType { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? Year { get; set; }
    public int? Month { get; set; }
    public Guid? TechnicianId { get; set; }
    public Guid? SupportAgentId { get; set; }
    public bool? InvolvedTechnician { get; set; }
}
```

**GeneratedReportDto.cs**
```csharp
public class GeneratedReportDto : FullAuditedEntityDto<Guid>
{
    public string ReportName { get; set; }
    public string ReportTypeName { get; set; }
    public DateTime GeneratedAt { get; set; }
    public long? FileSize { get; set; }
    public string FileSizeFormatted { get; set; }
}
```

### 3.2 Application Services

**IReportAppService.cs**
```csharp
public interface IReportAppService : IApplicationService
{
    Task<GeneratedReportDto> GenerateReportAsync(ReportGenerationDto input);
    Task<FileResult> DownloadReportAsync(Guid reportId);
    Task<PagedResultDto<GeneratedReportDto>> GetMyReportsAsync(int skipCount = 0, int maxResultCount = 10);
}
```

## Step 4: Domain Event Handlers

### 4.1 Email Event Handlers

**TicketCreatedEventHandler.cs**
```csharp
public class TicketCreatedEventHandler : IDomainEventHandler<TicketCreatedEvent>
{
    private readonly IEmailService _emailService;
    
    public async Task HandleEventAsync(TicketCreatedEvent eventData)
    {
        await _emailService.SendTicketCreatedEmailAsync(eventData.Ticket);
    }
}
```

**TicketUpdatedEventHandler.cs**
```csharp
public class TicketUpdatedEventHandler : IDomainEventHandler<TicketUpdatedEvent>
{
    private readonly IEmailService _emailService;
    
    public async Task HandleEventAsync(TicketUpdatedEvent eventData)
    {
        await _emailService.SendTicketUpdatedEmailAsync(eventData.Ticket, eventData.UpdateType);
    }
}
```

### 4.2 Domain Events

**TicketCreatedEvent.cs**
```csharp
public class TicketCreatedEvent : DomainEvent
{
    public SupportTicket Ticket { get; }
    
    public TicketCreatedEvent(SupportTicket ticket)
    {
        Ticket = ticket;
    }
}
```

## Step 5: PDF Generation Implementation

### 5.1 PDF Service

**IPdfService.cs**
```csharp
public interface IPdfService
{
    Task<byte[]> GeneratePdfFromTemplateAsync(string templateContent, object data);
    Task<string> SavePdfToStorageAsync(byte[] pdfBytes, string fileName);
}
```

### 5.2 PDF Generation Logic

```csharp
public class PdfService : IPdfService
{
    private readonly ITemplateRenderer _templateRenderer;
    private readonly ILogger<PdfService> _logger;

    public PdfService(ITemplateRenderer templateRenderer, ILogger<PdfService> logger)
    {
        _templateRenderer = templateRenderer;
        _logger = logger;
    }

    public async Task<byte[]> GeneratePdfFromTemplateAsync(string templateContent, object data)
    {
        try
        {
            // 1. Render template with data
            var renderedHtml = await _templateRenderer.RenderAsync(templateContent, data);
            
            // 2. Convert HTML to PDF using Aspose.PDF
            using (var ms = new MemoryStream())
            {
                // Create HTML to PDF converter
                var converter = new Aspose.Pdf.HtmlLoadOptions();
                
                // Load HTML content
                var document = new Aspose.Pdf.Document(new MemoryStream(
                    System.Text.Encoding.UTF8.GetBytes(renderedHtml)), converter);
                
                // Save to memory stream
                document.Save(ms, Aspose.Pdf.SaveFormat.Pdf);
                
                return ms.ToArray();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate PDF from template");
            throw new UserFriendlyException("Failed to generate PDF report");
        }
    }

    public async Task<string> SavePdfToStorageAsync(byte[] pdfBytes, string fileName)
    {
        try
        {
            var storagePath = Path.Combine("wwwroot", "reports");
            var fullPath = Path.Combine(storagePath, fileName);
            
            // Ensure directory exists
            Directory.CreateDirectory(storagePath);
            
            // Save file
            await File.WriteAllBytesAsync(fullPath, pdfBytes);
            
            return fullPath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save PDF to storage");
            throw new UserFriendlyException("Failed to save PDF report");
        }
    }
}
```

## Step 6: Template Management

### 6.1 Email Templates (Pre-seeded Data)

**EmailTemplateSeedData.cs**
```csharp
public class EmailTemplateSeedData : IDataSeedContributor
{
    public async Task SeedAsync(DataSeedContext context)
    {
        var emailTemplates = new List<EmailTemplate>
        {
            new EmailTemplate
            {
                Id = Guid.NewGuid(),
                Name = "Ticket Created",
                Subject = "New Support Ticket Created - #{TicketNumber}",
                Body = @"
                    Dear {CustomerName},
                    
                    Your support ticket has been created successfully.
                    Ticket Number: {TicketNumber}
                    Subject: {TicketSubject}
                    Priority: {Priority}
                    
                    We will review your ticket and get back to you soon.
                    
                    Best regards,
                    Support Team
                ",
                EmailType = EmailType.TicketCreated,
                IsActive = true
            },
            // Add more templates...
        };
        
        // Insert templates into database
    }
}
```

### 6.2 Report Templates (Pre-seeded Data)

**ReportTemplateSeedData.cs**
```csharp
public class ReportTemplateSeedData : IDataSeedContributor
{
    public async Task SeedAsync(DataSeedContext context)
    {
        var reportTemplates = new List<ReportTemplate>
        {
            new ReportTemplate
            {
                Id = Guid.NewGuid(),
                Name = "Technician Work Report",
                Description = "Report for technician's completed work",
                TemplateContent = @"
                    <h1>Technician Work Report</h1>
                    <p>Technician: {TechnicianName}</p>
                    <p>Period: {StartDate} to {EndDate}</p>
                    
                    <h2>Completed Tickets</h2>
                    <table>
                        <tr><th>Ticket #</th><th>Subject</th><th>Resolution Time</th></tr>
                        {#each CompletedTickets}
                        <tr>
                            <td>{TicketNumber}</td>
                            <td>{Subject}</td>
                            <td>{ResolutionTime}</td>
                        </tr>
                        {/each}
                    </table>
                ",
                ReportType = ReportType.TechnicianReport,
                IsActive = true
            },
            // Add more templates...
        };
        
        // Insert templates into database
    }
}
```

## Step 7: Implementation Steps

### Phase 1: Database & Domain Layer
1. Create database migrations for new tables
2. Implement domain entities (EmailTemplate, ReportTemplate, GeneratedReport)
3. Create enums (EmailType, ReportType)
4. Implement domain services (IEmailService, IReportService)
5. Create domain events and handlers

### Phase 2: PDF Generation
1. Install Aspose.PDF library
2. Implement IPdfService
3. Create PDF generation logic with HTML to PDF conversion
4. Set up file storage for PDFs

### Phase 3: Application Layer
1. Create DTOs
2. Implement ReportAppService
3. Add authorization policies
4. Create API endpoints for report generation

### Phase 4: Template Management
1. Create seed data for email templates
2. Create seed data for report templates
3. Test template rendering

### Phase 5: Integration
1. Integrate email sending with domain events
2. Test email delivery
3. Test PDF generation
4. Add logging and error handling

## Step 8: Configuration

### 8.1 Email Configuration
```json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "support@yourcompany.com",
    "FromName": "Support Team"
  }
}
```

### 8.2 PDF Storage Configuration
```json
{
  "FileStorage": {
    "PdfStoragePath": "wwwroot/reports/",
    "MaxFileSize": 10485760
  }
}
```

## Step 9: Security Considerations

1. **Authorization**: Only authorized users can generate reports
2. **File Access**: Secure PDF file access with proper authentication
3. **Template Security**: Validate template content to prevent injection attacks
4. **Email Security**: Validate email addresses and content

## Step 10: Testing Strategy

1. **Unit Tests**: Test domain services and PDF generation
2. **Integration Tests**: Test email sending and file storage
3. **Template Tests**: Test template rendering with various data
4. **Security Tests**: Test authorization and input validation

## Dependencies Required

```xml
<PackageReference Include="Aspose.PDF" Version="23.12.0" />
<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
```

## Notes

- **No Email API**: Emails are triggered automatically by domain events
- **Fixed Templates**: All templates are pre-seeded and not user-editable
- **PDF Storage**: Generated PDFs are stored on disk with database references
- **Authorization**: Report generation requires proper user permissions
- **Logging**: All email sends and report generations should be logged
- **Error Handling**: Graceful handling of template rendering and PDF generation failures
