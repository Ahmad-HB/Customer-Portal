using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Emailing;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.TextTemplating;
using MailKit.Net.Smtp;
using MimeKit;
using MailKit.Security;
using Scriban;
using Volo.Abp.Users;


namespace Customer.Portal.FeaturesManagers.MEmail;

public class EmailManager : DomainService, IEmailManager, ITransientDependency
{
    #region Fields

    private readonly IRepository<Email, Guid> _emailRepository;
    private readonly IRepository<EmailTemplate, Guid> _emailTemplateRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IRepository<SupportTicket, Guid> _supportTicketRepository;
    private readonly IEmailSender _emailSender;
    private readonly ITemplateRenderer _templateRenderer;
    private readonly IGuidGenerator _guidGenerator;
    private readonly ILogger<EmailManager> _logger;
    private readonly EmailManagerFactory _factory;
    private readonly IConfiguration _configuration;
    private readonly ICurrentUser _currentUser;

    #endregion

    #region Constructor

    public EmailManager(
        IRepository<Email, Guid> emailRepository,
        IRepository<EmailTemplate, Guid> emailTemplateRepository,
        IRepository<IdentityUser, Guid> identityUserRepository,
        IEmailSender emailSender,
        ITemplateRenderer templateRenderer,
        IGuidGenerator guidGenerator,
        ILogger<EmailManager> logger,
        EmailManagerFactory factory,
        IRepository<AppUser, Guid> appUserRepository,
        IConfiguration configuration,
        IRepository<SupportTicket, Guid> supportTicketRepository, ICurrentUser currentUser)
    {
        _emailRepository = emailRepository;
        _emailTemplateRepository = emailTemplateRepository;
        _identityUserRepository = identityUserRepository;
        _emailSender = emailSender;
        _templateRenderer = templateRenderer;
        _guidGenerator = guidGenerator;
        _logger = logger;
        _factory = factory;
        _appUserRepository = appUserRepository;
        _configuration = configuration;
        _supportTicketRepository = supportTicketRepository;
        _currentUser = currentUser;
    }

    #endregion

    #region Methods

    public async Task SendEmailTestAsync(string to, EmailType emailType)
    {
        var template = await _emailTemplateRepository.FirstOrDefaultAsync(et => et.EmailType == emailType);
        if (template == null)
        {
            throw new UserFriendlyException($"Email template for type {emailType} not found.");
        }

        _logger.LogInformation("SendEmailTestAsync - Raw template from database: {RawTemplate}", template.Format);

        await SendEmail(to, template, _currentUser.Name);
    }

    public async Task SendTicketCreatedEmailtAsync(string adress, Guid ticketId, Guid identityUserId)
    {
        var emailTemplate =
            await _emailTemplateRepository.FirstOrDefaultAsync(et => et.EmailType == EmailType.TicketCreated);
        if (emailTemplate == null)
        {
            throw new UserFriendlyException($"Email template for type {EmailType.TicketCreated} not found.");
        }

        var identityUser = await _identityUserRepository.FirstOrDefaultAsync(iu => iu.Id == identityUserId);
        if (identityUser == null)
        {
            throw new UserFriendlyException($"Identity user with ID {identityUserId} not found.");
        }

        // Get the actual ticket data with related entities
        var query = await _supportTicketRepository.GetQueryableAsync();
        var ticket = await AsyncExecuter.FirstOrDefaultAsync(query
            .Where(s => s.Id == ticketId)
            .Include(x => x.Supportagent)
            .Include(x => x.AppUser)
            .Include(x => x.Technician)
            .Include(x => x.ServicePlan));
        if (ticket == null)
        {
            throw new UserFriendlyException($"Support ticket with ID {ticketId} not found.");
        }

        // Get support agent information from included data
        var supportAgentName = ticket.Supportagent?.Name ?? ticket.Supportagent?.UserName ?? "Unassigned";
        var supportAgentEmail = ticket.Supportagent?.Email;
        var supportAgentPhone = ticket.Supportagent?.PhoneNumber;
        
        // Enhanced template data for ticket created email
        var now = DateTime.UtcNow;
        var templateData = new Dictionary<string, object>
        {
            // Basic Information
            ["UserName"] = identityUser.UserName ?? identityUser.Name ?? "User",
            ["TicketId"] = ticketId.ToString(),
            ["TicketName"] = ticket.Subject,
            ["TicketDescription"] = ticket.Description ?? "No description provided",
            
            // Ticket Details
            ["Priority"] = ticket.Priority?.ToString() ?? "Not Set",
            ["Status"] = ticket.Status.ToString(),
            ["CreatedDate"] = ticket.CreatedAt.ToString("MMMM dd, yyyy"),
            ["CreatedTime"] = ticket.CreatedAt.ToString("hh:mm tt"),
            
            // Support Agent Information
            ["SupportAgentName"] = supportAgentName ?? "Unassigned",
            ["AssignedSupportAgent"] = supportAgentName ?? "Unassigned",
            
            // Company Information
            ["CompanyName"] = _configuration["Settings:Abp.Mailing.DefaultFromDisplayName"] ?? "Your Company Name",
            ["SupportEmail"] = supportAgentEmail ?? _configuration["Settings:Company:SupportEmail"] ?? "support@yourcompany.com",
            ["SupportPhone"] = supportAgentPhone ?? _configuration["Settings:Company:SupportPhone"] ?? "+1 (555) 123-4567",
            ["EmergencyPhone"] = _configuration["Settings:Company:EmergencyPhone"] ?? "+1 (555) 911-HELP",
            
            // Action URLs
            ["ActionUrl"] = "http://localhost:5173/tickets",
            
            // Additional Information
            ["EstimatedResolutionTime"] = GetEstimatedResolutionTime(ticket)
        };

        _logger.LogInformation(
            "Template data: UserName={UserName}, TicketId={TicketId}, TicketName={TicketName}, TicketDescription={TicketDescription}",
            templateData["UserName"], templateData["TicketId"], templateData["TicketName"], templateData["TicketDescription"]);

        _logger.LogInformation("IdentityUser details: UserName={UserName}, Name={Name}, Email={Email}",
            identityUser.UserName, identityUser.Name, identityUser.Email);

        _logger.LogInformation("Ticket details: Id={Id}, Subject={Subject}, Description={Description}",
            ticket.Id, ticket.Subject, ticket.Description);

        string emailContent;
        try
        {
            // Now use the actual HTML template from the database
            
            var tmplate = Template.Parse(emailTemplate.Format);
            if (tmplate.HasErrors)
            {
                _logger.LogError("Template parsing errors: {Errors}",
                    string.Join(", ", tmplate.Messages.Select(m => m.Message)));
                throw new UserFriendlyException("Email template has parsing errors");
            }

            emailContent = tmplate.Render(templateData);


            if (string.IsNullOrEmpty(emailContent))
            {
                _logger.LogError("Rendered email content is empty");
                throw new UserFriendlyException("Email template rendering resulted in empty content");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rendering email template");
            throw new UserFriendlyException($"Failed to render email template: {ex.Message}");
        }

        // Create a copy of the template with the rendered content
        var renderedTemplate = new EmailTemplate(
            emailTemplate.Id,
            emailTemplate.EmailType,
            emailTemplate.TemplateType,
            emailTemplate.Name,
            emailContent
        );

        var (isSuccess, errorMessage) = await SendEmail(adress, renderedTemplate, identityUser.Name);

        var email = new Email(
            _guidGenerator.Create(),
            identityUserId,
            emailTemplate.Id,
            adress,
            emailTemplate.Name,
            emailContent,
            DateTime.Now,
            isSuccess,
            errorMessage
        );

        await _emailRepository.InsertAsync(email);
    }

    public async Task SendTicketUpdatedEmailAsync(string adress, Guid ticketId, Guid identityUserId, UpdateType updateType, string? previousValue = null, string? newValue = null)
    {
        _logger.LogInformation("SendTicketUpdatedEmailAsync called for ticket {TicketId}, updateType: {UpdateType}", ticketId, updateType);
        
        var template = await _emailTemplateRepository.FirstOrDefaultAsync(et => et.EmailType == EmailType.TicketUpdated);
        if (template == null)
        {
            _logger.LogError("Email template for type {EmailType} not found in database", EmailType.TicketUpdated);
            throw new UserFriendlyException($"Email template for type {EmailType.TicketUpdated} not found.");
        }
        
        _logger.LogInformation("Found email template for TicketUpdated: {TemplateId}", template.Id);

        var identityUser = await _identityUserRepository.FirstOrDefaultAsync(iu => iu.Id == identityUserId);
        if (identityUser == null)
        {
            throw new UserFriendlyException($"Identity user with ID {identityUserId} not found.");
        }

        // Get the actual ticket data with related entities
        var query = await _supportTicketRepository.GetQueryableAsync();
        var ticket = await AsyncExecuter.FirstOrDefaultAsync(query
            .Where(s => s.Id == ticketId)
            .Include(x => x.AppUser)
            .Include(x => x.Technician)
            .Include(x => x.ServicePlan));
        if (ticket == null)
        {
            throw new UserFriendlyException($"Support ticket with ID {ticketId} not found.");
        }
        
        // Get support agent information - fetch it separately since Include might not work properly
        IdentityUser supportAgent = null;
        if (ticket.SupportagentId.HasValue)
        {
            supportAgent = await _identityUserRepository.FirstOrDefaultAsync(x => x.Id == ticket.SupportagentId.Value);
            if (supportAgent != null)
            {
                _logger.LogInformation("Support agent loaded from repository: {SupportAgentName}", supportAgent.Name);
            }
            else
            {
                _logger.LogWarning("Support agent with ID {SupportAgentId} not found in repository", ticket.SupportagentId.Value);
            }
        }
        else
        {
            _logger.LogInformation("No support agent assigned to ticket {TicketId}", ticketId);
        }
        
        IdentityUser technician = null;
        if (ticket.TechnicianId.HasValue)
        {
            technician = await _identityUserRepository.FirstOrDefaultAsync(x => x.Id == ticket.TechnicianId.Value);
            if (technician != null)
            {
                _logger.LogInformation("Technician loaded from repository: {TechnicianName}", technician.Name);
            }
            else
            {
                _logger.LogWarning("Technician with ID {TechnicianId} not found in repository", ticket.TechnicianId.Value);
            }
        }
        else
        {
            _logger.LogInformation("No technician assigned to ticket {TicketId}", ticketId);
        }
        
        
        var (updateTypeDescription, previousVal, newVal) = GetUpdateInformation(ticket, updateType, previousValue, newValue);
        
        var daysSinceCreated = (DateTime.UtcNow - ticket.CreatedAt).Days;
        
        var templateData = new Dictionary<string, object>
        {
            // Basic Information
            ["UserName"] = identityUser.UserName ?? identityUser.Name ?? "User",
            ["TicketId"] = ticketId.ToString(),
            ["TicketName"] = ticket.Subject,
            ["TicketDescription"] = ticket.Description ?? "No description provided",
            
            // Update Information
            ["UpdateType"] = updateTypeDescription,
            ["PreviousValue"] = previousVal,
            ["NewValue"] = newVal,
            ["UpdateDate"] = DateTime.UtcNow.ToString("MMMM dd, yyyy"),
            ["UpdateTime"] = DateTime.UtcNow.ToString("hh:mm tt"),
            
            // Current Ticket Status
            ["CurrentStatus"] = ticket.Status.ToString(),
            ["CurrentPriority"] = ticket.Priority?.ToString() ?? "Not Set",
            ["AssignedTechnician"] = technician?.Name ?? "Unassigned",
            ["AssignedSupportAgent"] = supportAgent?.Name ?? "Unassigned",
            ["SupportAgentName"] = supportAgent?.Name ?? "Unassigned",
            
            // Ticket Timeline
            ["TicketCreatedDate"] = ticket.CreatedAt.ToString("MMMM dd, yyyy"),
            ["DaysSinceCreated"] = daysSinceCreated,
            
            // Company Information
            ["CompanyName"] = _configuration["Settings:Abp.Mailing.DefaultFromDisplayName"] ?? "Your Company Name",
            ["SupportEmail"] = supportAgent?.Email ?? _configuration["Settings:Company:SupportEmail"] ?? "support@yourcompany.com",
            ["SupportPhone"] = supportAgent?.PhoneNumber ?? _configuration["Settings:Company:SupportPhone"] ?? "+1 (555) 123-4567",
            
            // Action Information
            ["ActionUrl"] = "http://localhost:5173/tickets",
            ["NextSteps"] = GetNextSteps(ticket, updateType),
            ["ContactInstructions"] = GetContactInstructions(ticket),
            ["EstimatedResolutionTime"] = GetEstimatedResolutionTime(ticket)
        };

        string emailContent;
        try
        {
            var tmplate = Template.Parse(template.Format);
            if (tmplate.HasErrors)
            {
                _logger.LogError("Template parsing errors: {Errors}",
                    string.Join(", ", tmplate.Messages.Select(m => m.Message)));
                throw new UserFriendlyException("Email template has parsing errors");
            }

            emailContent = tmplate.Render(templateData);

            if (string.IsNullOrEmpty(emailContent))
            {
                _logger.LogError("Rendered email content is empty");
                throw new UserFriendlyException("Email template rendering resulted in empty content");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rendering email template");
            throw new UserFriendlyException($"Failed to render email template: {ex.Message}");
        }

        // Create a copy of the template with the rendered content
        var renderedTemplate = new EmailTemplate(
            template.Id,
            template.EmailType,
            template.TemplateType,
            template.Name,
            emailContent
        );

        var (isSuccess, errorMessage) = await SendEmail(adress, renderedTemplate, identityUser.Name);

        var email = new Email(
            _guidGenerator.Create(),
            identityUserId,
            template.Id,
            adress,
            template.Name,
            emailContent,
            DateTime.Now,
            isSuccess,
            errorMessage
        );

        await _emailRepository.InsertAsync(email);
        
        _logger.LogInformation("Ticket updated email sent successfully for ticket {TicketId} to {EmailAddress}. Success: {IsSuccess}", 
            ticketId, adress, isSuccess);
    }
    
    public async Task SendCustomerRegistrationEmailAsync(string adress, Guid identityUserId)
    {
        var template =  await _emailTemplateRepository.FirstOrDefaultAsync(et => et.EmailType == EmailType.CustomerRegistration);
        if (template == null)
        {
            throw new UserFriendlyException($"Email template for type {EmailType.CustomerRegistration} not found.");
        }


        var identityUser = await _identityUserRepository.FirstOrDefaultAsync(iu => iu.Id == identityUserId);
        if (identityUser == null)
        {
            throw new UserFriendlyException($"Identity user with ID {identityUserId} not found.");
        }

        // Enhanced template data for customer registration email
        var templateData = new Dictionary<string, object>
        {
            // Basic User Information
            ["UserName"] = identityUser.UserName ?? identityUser.Name ?? "User",
            ["UserEmail"] = identityUser.Email,
            ["UserType"] = _appUserRepository.GetAsync(x => x.IdentityUserId == identityUserId).Result?.UserType.ToString() ?? "not specified",
            ["Name"] = identityUser.Name ?? identityUser.UserName ?? "User",
            ["FirstName"] = identityUser.Name?.Split(' ').FirstOrDefault() ?? identityUser.UserName ?? "User",
            
            // Registration Details
            ["RegistrationDate"] = identityUser.CreationTime.ToString("MMMM dd, yyyy"),
            ["RegistrationTime"] = identityUser.CreationTime.ToString("hh:mm tt"),
            
            // Company Information
            ["CompanyName"] = _configuration["Settings:Abp.Mailing.DefaultFromDisplayName"] ?? "Your Company Name", 
            ["SupportEmail"] = _configuration["Settings:Company:SupportEmail"] ?? "support@yourcompany.com", 
            ["SupportPhone"] = _configuration["Settings:Company:SupportPhone"] ?? "+1 (555) 123-4567",
            
            // Action URLs
            ["LoginUrl"] = "http://localhost:5173/login",
            ["HelpCenterUrl"] = "https://yourportal.com/help",
            ["ProfileUrl"] = "https://yourportal.com/profile",
            ["DashboardUrl"] = "https://yourportal.com/dashboard",
            
            // Additional Information
            ["ReferenceId"] = identityUserId.ToString().Substring(0, 8).ToUpper(),
            ["WelcomeMessage"] = "Welcome to our platform! We're excited to have you on board.",
            ["NextSteps"] = "Complete your profile setup and explore our features.",
            ["ContactInstructions"] = "If you have any questions, please contact our support team."
        };



        string emailContent;
        try
        {
            var tmplate = Template.Parse(template.Format);
            if (tmplate.HasErrors)
            {
                _logger.LogError("Template parsing errors: {Errors}",
                    string.Join(", ", tmplate.Messages.Select(m => m.Message)));
                throw new UserFriendlyException("Email template has parsing errors");
            }

            emailContent = tmplate.Render(templateData);


            if (string.IsNullOrEmpty(emailContent))
            {
                _logger.LogError("Rendered email content is empty");
                throw new UserFriendlyException("Email template rendering resulted in empty content");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rendering email template");
            throw new UserFriendlyException($"Failed to render email template: {ex.Message}");
        }

        // Create a copy of the template with the rendered content
        var renderedTemplate = new EmailTemplate(
            template.Id,
            template.EmailType,
            template.TemplateType,
            template.Name,
            emailContent
        );

        var (isSuccess, errorMessage) = await SendEmail(adress, renderedTemplate, identityUser.Name);

        var email = new Email(
            _guidGenerator.Create(),
            identityUserId,
            template.Id,
            adress,
            template.Name,
            emailContent,
            DateTime.Now,
            isSuccess,
            errorMessage
        );

        await _emailRepository.InsertAsync(email);
    }

    public async Task SendConfirmationEmailAsync(string adress, Guid identityUserId, string actionType,
        string actionDetails)
    {
        var template = await _emailTemplateRepository.FirstOrDefaultAsync(et => et.EmailType == EmailType.Confirmation);
        if (template == null)
        {
            throw new UserFriendlyException($"Email template for type {EmailType.Confirmation} not found.");
        }

        var identityUser = await _identityUserRepository.FirstOrDefaultAsync(iu => iu.Id == identityUserId);
        if (identityUser == null)
        {
            throw new UserFriendlyException($"Identity user with ID {identityUserId} not found.");
        }

        // Enhanced template data for confirmation email
        var now = DateTime.UtcNow;
        var templateData = new Dictionary<string, object>
        {
            // Basic Information
            ["UserName"] = identityUser.UserName ?? identityUser.Name ?? "User",
            ["ActionType"] = actionType,
            ["ActionDetails"] = actionDetails,
            ["UserEmail"] = identityUser.Email,
            
            
            // Request Information
            ["RequestDate"] = now.ToString("MMMM dd, yyyy"),
            ["RequestTime"] = now.ToString("hh:mm tt"),
            ["ConfirmationDate"] = now.ToString("MMMM dd, yyyy"),
            ["ConfirmationTime"] = now.ToString("hh:mm tt"),
            
            // Company Information
            ["CompanyName"] = _configuration["Settings:Abp.Mailing.DefaultFromDisplayName"] ?? "Your Company Name",
            ["SupportEmail"] = _configuration["Settings:Company:SupportEmail"] ?? "support@yourcompany.com",
            ["SupportPhone"] = _configuration["Settings:Company:SupportPhone"] ?? "+1 (555) 123-4567",
            
            ["ConfirmationUrl"] = $"https://yourportal.com/confirm/{Guid.NewGuid()}",
            ["CancelUrl"] = $"https://yourportal.com/cancel/{Guid.NewGuid()}",
            
            // Additional Information
            ["ReferenceId"] = Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
            ["ExpirationTime"] = "24 hours",
            ["ImportantNotice"] = $"This action will {actionType.ToLower()}. Please review the details carefully before confirming.",
            ["NextSteps"] = "Click the confirmation button below to proceed with your request.",
            ["ContactInstructions"] = "If you have any questions or did not request this action, please contact our support team immediately."
        };

        string emailContent;
        try
        {
            var tmplate = Template.Parse(template.Format);
            if (tmplate.HasErrors)
            {
                _logger.LogError("Template parsing errors: {Errors}",
                    string.Join(", ", tmplate.Messages.Select(m => m.Message)));
                throw new UserFriendlyException("Email template has parsing errors");
            }

            emailContent = tmplate.Render(templateData);

            if (string.IsNullOrEmpty(emailContent))
            {
                _logger.LogError("Rendered email content is empty");
                throw new UserFriendlyException("Email template rendering resulted in empty content");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rendering email template");
            throw new UserFriendlyException($"Failed to render email template: {ex.Message}");
        }

        // Create a copy of the template with the rendered content
        var renderedTemplate = new EmailTemplate(
            template.Id,
            template.EmailType,
            template.TemplateType,
            template.Name,
            emailContent
        );

        var (isSuccess, errorMessage) = await SendEmail(adress, renderedTemplate, identityUser.Name);

        var email = new Email(
            _guidGenerator.Create(),
            identityUserId,
            template.Id,
            adress,
            template.Name,
            emailContent,
            DateTime.Now,
            isSuccess,
            errorMessage
        );

        await _emailRepository.InsertAsync(email);
    }

    private (string updateTypeDescription, string previousValue, string newValue) GetUpdateInformation(SupportTicket ticket, UpdateType updateType, string? previousValue, string? newValue)
    {
        return updateType switch
        {
            UpdateType.StatusChange => (
                "Status Change",
                previousValue ?? "Previous Status",
                newValue ?? ticket.Status.ToString()
            ),
            UpdateType.PriorityChange => (
                "Priority Change",
                previousValue ?? "Previous Priority",
                newValue ?? ticket.Priority?.ToString() ?? "Not Set"
            ),
            UpdateType.AssignmentChange => (
                "Assignment Change",
                previousValue ?? "Previous Assignment",
                newValue ?? GetAssignmentDescription(ticket)
            ),
            UpdateType.NewComment => (
                "New Comment Added",
                "No Previous Comment",
                "A new comment has been added to your ticket"
            ),
            _ => (
                "General Update",
                previousValue ?? "Previous Value",
                newValue ?? "Updated"
            )
        };
    }

    private string GetAssignmentDescription(SupportTicket ticket)
    {
        if (ticket.TechnicianId.HasValue)
        {
            return $"Assigned to Technician: {ticket.Technician?.Name ?? "Technician"}";
        }
        if (ticket.SupportagentId.HasValue)
        {
            return $"Assigned to Support Agent: {ticket.Supportagent?.Name ?? "Support Agent"}";
        }
        return "Unassigned";
    }

    private string GetNextSteps(SupportTicket ticket, UpdateType updateType)
    {
        return updateType switch
        {
            UpdateType.StatusChange => ticket.Status switch
            {
                TicketStatus.Open => "Your ticket is now open and waiting to be assigned to a support agent.",
                TicketStatus.InProgress => "Your ticket is now being worked on by our support team.",
                TicketStatus.Resolved => "Your ticket has been resolved. Please test the solution and let us know if you need any further assistance.",
                TicketStatus.Closed => "Your ticket has been closed. If you need further assistance, please create a new ticket.",
                _ => "Your ticket status has been updated."
            },
            UpdateType.PriorityChange => "Your ticket priority has been updated. This may affect the order in which your ticket is processed.",
            UpdateType.AssignmentChange => "Your ticket has been assigned to a team member who will contact you soon.",
            UpdateType.NewComment => "A new comment has been added to your ticket. Please review the latest information.",
            _ => "Your ticket has been updated. Please check the details above."
        };
    }

    private string GetContactInstructions(SupportTicket ticket)
    {
        if (ticket.SupportagentId.HasValue)
        {
            return "If you have any questions, please reply to this email or contact our support team directly.";
        }
        return "If you have any questions, please contact our support team and reference your ticket ID.";
    }

    private string GetEstimatedResolutionTime(SupportTicket ticket)
    {
        return ticket.Priority switch
        {
            TicketPriority.Critical => "Within 2 hours",
            TicketPriority.High => "Within 4 hours", 
            TicketPriority.Medium => "Within 24 hours",
            TicketPriority.Low => "Within 3-5 business days",
            _ => "We will work to resolve your ticket as quickly as possible"
        };
    }

    private async Task<(bool IsSuccess, string ErrorMessage)> SendEmail(string address, EmailTemplate template, string userName)
    {
        try
        {
            // Get email configuration from appsettings.json
            var smtpHost = _configuration["Settings:Abp.Mailing.Smtp.Host"] ?? "smtp.gmail.com";
            var smtpPortStr = _configuration["Settings:Abp.Mailing.Smtp.Port"] ?? "587";
            var smtpPort = int.Parse(smtpPortStr);
            var smtpUsername = _configuration["Settings:Abp.Mailing.Smtp.UserName"] ?? "";
            var smtpPassword = _configuration["Settings:Abp.Mailing.Smtp.Password"] ?? "";
            var enableSslStr = _configuration["Settings:Abp.Mailing.Smtp.EnableSsl"] ?? "false";
            var enableSsl = bool.Parse(enableSslStr);
            var defaultFromAddress = _configuration["Settings:Abp.Mailing.DefaultFromAddress"] ?? "";
            var defaultFromDisplayName =
                _configuration["Settings:Abp.Mailing.DefaultFromDisplayName"] ?? "Customer Portal";

            var message = _factory.CreateMimeMessage();
            var smtpClient = _factory.CreateSmtpClient();
            var bodyBuilder = _factory.CreateBodyBuilder();

            message.From.Add(new MailboxAddress(defaultFromDisplayName, defaultFromAddress));
            message.To.Add(new MailboxAddress(userName, address));
            message.Subject = template.Name;
            bodyBuilder.HtmlBody = template.Format;
            message.Body = bodyBuilder.ToMessageBody();

            // Use SSL if enabled, otherwise use StartTls
            var secureSocketOptions = enableSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;

            await smtpClient.ConnectAsync(smtpHost, smtpPort, secureSocketOptions);
            await smtpClient.AuthenticateAsync(smtpUsername, smtpPassword);
            await smtpClient.SendAsync(message);
            await smtpClient.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {EmailAddress} using SMTP host {SmtpHost}", address,
                smtpHost);
            return (true, string.Empty);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {EmailAddress}", address);
            return (false, ex.Message);
        }
    }


    #endregion
}