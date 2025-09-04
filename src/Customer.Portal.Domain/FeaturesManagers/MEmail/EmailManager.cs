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
        IRepository<SupportTicket, Guid> supportTicketRepository)
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

        await SendEmail(to, template);
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

        // Get the actual ticket data
        var ticket = await _supportTicketRepository.FirstOrDefaultAsync(x => x.Id == ticketId);
        if (ticket == null)
        {
            throw new UserFriendlyException($"Support ticket with ID {ticketId} not found.");
        }

        // Try using a Dictionary instead of anonymous object
        var templateData = new Dictionary<string, object>
        {
            ["UserName"] = identityUser.UserName ?? identityUser.Name ?? "User",
            ["TicketId"] = ticketId.ToString(),
            ["TicketName"] = ticket.Subject,
            ["TicketDescription"] = ticket.Description,
            ["ActionUrl"] = $"https://yourportal.com/tickets/{ticketId}"
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

        var (isSuccess, errorMessage) = await SendEmail(adress, renderedTemplate);

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

    public async Task SendTicketUpdatedEmailAsync(string adress, Guid ticketId, Guid identityUserId)
    {
        var template = await _emailTemplateRepository.FirstOrDefaultAsync(et => et.EmailType == EmailType.TicketUpdated);
        if (template == null)
        {
            throw new UserFriendlyException($"Email template for type {EmailType.TicketUpdated} not found.");
        }

        var identityUser = await _identityUserRepository.FirstOrDefaultAsync(iu => iu.Id == identityUserId);
        if (identityUser == null)
        {
            throw new UserFriendlyException($"Identity user with ID {identityUserId} not found.");
        }

        // Get the actual ticket data
        var ticket = await _supportTicketRepository.FirstOrDefaultAsync(x => x.Id == ticketId);
        if (ticket == null)
        {
            throw new UserFriendlyException($"Support ticket with ID {ticketId} not found.");
        }

        var templateData = new Dictionary<string, object>
        {
            ["UserName"] = identityUser.UserName ?? identityUser.Name ?? "User",
            ["TicketId"] = ticketId.ToString(),
            ["TicketName"] = ticket.Subject,
            ["UpdateType"] = "Status Change", // You might want to track what was updated
            ["PreviousValue"] = "Open", // You might want to track previous values
            ["NewValue"] = "In Progress", // You might want to track new values
            ["ActionUrl"] = $"https://yourportal.com/tickets/{ticketId}"
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

        var (isSuccess, errorMessage) = await SendEmail(adress, renderedTemplate);

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

        var templateData = new Dictionary<string, object>
        {
            ["UserName"] = identityUser.UserName ?? identityUser.Name ?? "User",
            ["UserEmail"] = identityUser.Email,
            ["Name"] = identityUser.Name ?? identityUser.UserName ?? "User",
            ["RegistrationDate"] = identityUser.CreationTime.ToString("yyyy-MM-dd"),
            ["LoginUrl"] = "https://yourportal.com/login",
            ["HelpCenterUrl"] = "https://yourportal.com/help"
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

        var (isSuccess, errorMessage) = await SendEmail(adress, renderedTemplate);

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

        var templateData = new Dictionary<string, object>
        {
            ["UserName"] = identityUser.UserName ?? identityUser.Name ?? "User",
            ["ActionType"] = actionType,
            ["ActionDetails"] = actionDetails,
            ["ConfirmationUrl"] = $"https://yourportal.com/confirm/{Guid.NewGuid()}",
            ["CancelUrl"] = $"https://yourportal.com/cancel/{Guid.NewGuid()}"
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

        var (isSuccess, errorMessage) = await SendEmail(adress, renderedTemplate);

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



    private async Task<(bool IsSuccess, string ErrorMessage)> SendEmail(string address, EmailTemplate template)
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
            message.To.Add(new MailboxAddress("user", address));
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