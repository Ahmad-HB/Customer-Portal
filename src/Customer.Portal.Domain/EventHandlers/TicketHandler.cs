using System;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Customer.Portal.FeaturesManagers.MEmail;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Entities.Events;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.EventBus;
using Volo.Abp.Identity;

namespace Customer.Portal.EventHandlers;

public class TicketHandler : ILocalEventHandler<EntityCreatedEventData<SupportTicket>>,
    ITransientDependency,
    ILocalEventHandler<EntityUpdatedEventData<SupportTicket>>
{

    #region Fields

    private readonly IEmailManager _emailManager;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IRepository<EmailTemplate, Guid> _emailTemplateRepository;
    private readonly ILogger<TicketHandler> _logger;

    #endregion


    #region Ctor

    public TicketHandler(
        IEmailManager emailManager,
        IRepository<AppUser, Guid> appUserRepository,
        IRepository<IdentityUser, Guid> identityUserRepository,
        IRepository<EmailTemplate, Guid> emailTemplateRepository,
        ILogger<TicketHandler> logger)
    {
        _emailManager = emailManager;
        _appUserRepository = appUserRepository;
        _identityUserRepository = identityUserRepository;
        _emailTemplateRepository = emailTemplateRepository;
        _logger = logger;
    }
    
    #endregion

    #region Methods

    public async Task HandleEventAsync(EntityCreatedEventData<SupportTicket> eventData)
    {
        try
        {
            var ticket = eventData.Entity;
            
            _logger.LogInformation("Processing ticket created event for ticket {TicketId}", ticket.Id);
            
            // Get the app user and their identity user
            var appUser = await _appUserRepository.GetAsync(ticket.AppUserId);
            var identityUser = await _identityUserRepository.GetAsync(appUser.IdentityUserId);
            
            _logger.LogInformation("Sending ticket created email for ticket {TicketId} to user {UserId}", 
                ticket.Id, identityUser.Id);
            
            // Check if email templates exist before trying to send emails
            var ticketCreatedTemplate = await _emailTemplateRepository.FirstOrDefaultAsync(et => et.EmailType == EmailType.TicketCreated);
            if (ticketCreatedTemplate != null)
            {
                // Send ticket created email
                await _emailManager.SendTicketCreatedEmailtAsync(identityUser.Email, ticket.Id, identityUser.Id);
                _logger.LogInformation("Ticket created email process completed for ticket {TicketId}", ticket.Id);
            }
            else
            {
                _logger.LogWarning("Ticket created email template not found. Skipping email for ticket {TicketId}", ticket.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling ticket created event for ticket {TicketId}. Error: {ErrorMessage}", 
                eventData.Entity.Id, ex.Message);
        }
    }

    public async Task HandleEventAsync(EntityUpdatedEventData<SupportTicket> eventData)
    {
        try
        {
            var ticket = eventData.Entity;
            
            // Get the app user and their identity user
            var appUser = await _appUserRepository.GetAsync(ticket.AppUserId);
            var identityUser = await _identityUserRepository.GetAsync(appUser.IdentityUserId);
            
            _logger.LogInformation("Sending ticket updated email for ticket {TicketId} to user {UserId}", 
                ticket.Id, identityUser.Id);
            
            // Check if email templates exist before trying to send emails
            var ticketUpdatedTemplate = await _emailTemplateRepository.FirstOrDefaultAsync(et => et.EmailType == EmailType.TicketUpdated);
            if (ticketUpdatedTemplate != null)
            {
                // Send ticket updated email
                await _emailManager.SendTicketUpdatedEmailAsync(identityUser.Email, ticket.Id, identityUser.Id);
                _logger.LogInformation("Ticket updated email process completed for ticket {TicketId}", ticket.Id);
            }
            else
            {
                _logger.LogWarning("Ticket updated email template not found. Skipping email for ticket {TicketId}", ticket.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling ticket updated event for ticket {TicketId}", eventData.Entity.Id);
        }
    }

    #endregion
    
}