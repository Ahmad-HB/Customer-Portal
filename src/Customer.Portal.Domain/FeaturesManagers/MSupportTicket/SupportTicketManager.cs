using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Customer.Portal.FeaturesManagers.MEmail;
using Customer.Portal.FeaturesManagers.MTicketComment;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.Uow;


namespace Customer.Portal.FeaturesManagers.MSupportTicket;

public class SupportTicketManager : DomainService, ISupportTicketManager
{
    #region Fields

    private readonly IRepository<SupportTicket, Guid> _supportTicketRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IGuidGenerator _guidGenerator;
    private readonly ITicketCommentManager _ticketCommentManager;
    private readonly IEmailManager _emailManager;
    private readonly ILogger<SupportTicketManager> _logger;

    #endregion

    #region Ctor

    public SupportTicketManager(IRepository<SupportTicket, Guid> supportTicketRepository,
        IRepository<IdentityUser, Guid> userRepository, IGuidGenerator guidGenerator,
        IRepository<AppUser, Guid> appUserRepository,
        ITicketCommentManager ticketCommentManager,
        IEmailManager emailManager,
        ILogger<SupportTicketManager> logger)
    {
        _supportTicketRepository = supportTicketRepository;
        _identityUserRepository = userRepository;
        _guidGenerator = guidGenerator;
        _appUserRepository = appUserRepository;
        _ticketCommentManager = ticketCommentManager;
        _emailManager = emailManager;
        _logger = logger;
    }

    #endregion

    #region Methods

    public async Task CreateSupportTicketAsync(SupportTicket supportTicket, Guid identityUserId)
    {
        try
        {
            var query = await _identityUserRepository.GetQueryableAsync();
            var identityUser = await _identityUserRepository.GetAsync(identityUserId);

            var appUserId = await query
                .Where(u => u.Id == identityUserId)
                .Select(u => EF.Property<Guid>(u, "AppUserId"))
                .FirstOrDefaultAsync();

            var appUser = await _appUserRepository.GetAsync(appUserId);
            if (appUser == null)
            {
                throw new UserFriendlyException("App user not found.");
            }

            supportTicket.AppUserId = appUserId;
            supportTicket.Status = TicketStatus.Open;
            supportTicket.CreatedAt = DateTime.UtcNow;

            var supportTicket2 = new SupportTicket(
                _guidGenerator.Create(),
                appUserId,
                supportTicket.ServicePlanId,
                supportTicket.Subject,
                supportTicket.Description
            );

            await _supportTicketRepository.InsertAsync(supportTicket2);

        }
        catch (Exception ex)
        {
            throw new UserFriendlyException(ex.Message);
        }
        
    }

    public async Task<SupportTicket> GetSupportTicketByIdAsync(Guid supportTicketId)
    {
        var query = await _supportTicketRepository.GetQueryableAsync();
        var supportTicket = await AsyncExecuter.FirstOrDefaultAsync(query
            .Where(s => s.Id == supportTicketId)
            .Include(x => x.Supportagent)
            .Include(x => x.AppUser)
            .Include(x => x.Technician));
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        return supportTicket;
    }

    public async Task<List<SupportTicket>> GetSupportTicketsAsync(Guid identityUserId)
    {
        var query = await _identityUserRepository.GetQueryableAsync();
        var appUserId = await query
            .Where(u => u.Id == identityUserId)
            .Select(u => EF.Property<Guid>(u, "AppUserId"))
            .FirstOrDefaultAsync();

        var appUser = await _appUserRepository.GetAsync(appUserId);
        if (appUser == null)
        {
            throw new UserFriendlyException("App user not found.");
        }

        var supportTicketQuery = await _supportTicketRepository.GetQueryableAsync();
        
        // Simple role-based filtering
        if (appUser.UserType == UserType.Admin)
        {
            // Admin can see all tickets
            return await supportTicketQuery.OrderByDescending(x => x.CreatedAt).ToListAsync();
        }
        else if (appUser.UserType == UserType.Technician)
        {
            // Technician sees tickets assigned to them
            return await supportTicketQuery
                .Where(x => x.TechnicianId == identityUserId)
                .Include(x => x.Technician)
                .Include(x => x.Supportagent)
                .Include(x => x.AppUser)
                .Include(x => x.ServicePlan)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
        else if (appUser.UserType == UserType.SupportAgent)
        {
            // Support agent sees tickets assigned to them
            return await supportTicketQuery
                .Where(x => x.SupportagentId == identityUserId)
                .Include(x => x.Technician)
                .Include(x => x.Supportagent)
                .Include(x => x.AppUser)
                .Include(x => x.ServicePlan)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
        else
        {
            // Customer sees their own tickets
            return await supportTicketQuery
                .Where(x => x.AppUserId == appUserId)
                .Include(x => x.Technician)
                .Include(x => x.Supportagent)
                .Include(x => x.AppUser)
                .Include(x => x.ServicePlan)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
    }

    public async Task DeleteSupportTicketAsync(Guid supportTicketId)
    {
        var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        await _supportTicketRepository.DeleteAsync(supportTicket);
    }

    public async Task<bool> AssignSupportAgentAsync(Guid supportTicketId)
    {
        
        var query = await _appUserRepository.GetQueryableAsync();
        var supportTicket = await _supportTicketRepository.FirstOrDefaultAsync(x => x.Id == supportTicketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        var availableAgents = await AsyncExecuter.ToListAsync(
            query.Where(x => x.UserType == UserType.SupportAgent && x.IsActive));

        if (availableAgents == null || !availableAgents.Any())
        {
            throw new UserFriendlyException("No available support agents at the moment.");
        }

        var random = new Random();
        var availableAgent = availableAgents.OrderBy(x => random.Next()).FirstOrDefault();

        if (availableAgent != null)
        {
            _logger.LogInformation("Assigning support agent {AgentId} to ticket {TicketId}", availableAgent.Id, supportTicketId);
            
            // Use IdentityUserId instead of AppUser.Id since SupportagentId references IdentityUser
            supportTicket.SupportagentId = availableAgent.IdentityUserId;
            await _supportTicketRepository.UpdateAsync(supportTicket);
            
            _logger.LogInformation("Support agent assigned successfully to ticket {TicketId}. Now sending assignment email.", supportTicketId);
            
            // Send assignment email notification
            var supportAgentName = availableAgent.Name ?? availableAgent.Email ?? "Support Agent";
            await SendAssignmentUpdateEmailAsync(supportTicket, $"Assigned to Support Agent: {supportAgentName}");
            
            _logger.LogInformation("Assignment email process completed for ticket {TicketId}", supportTicketId);
            
            
            return true;
        }
        else
        {
            return false;
        }
        
    }

    public async Task AssignTechnicianAsync(Guid supportTicketId, Guid technicianId)
    {
        var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
        var technician = await _appUserRepository.GetAsync(x => x.Id == technicianId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        if (technician == null ||  technician.UserType != UserType.Technician)
        {
            throw new UserFriendlyException("Invalid technician.");
        }

        supportTicket.TechnicianId = technician.IdentityUserId;
        await _supportTicketRepository.UpdateAsync(supportTicket);

        // Send assignment email notification
        var technicianName = technician.Name ?? technician.Email ?? "Technician";
        await SendAssignmentUpdateEmailAsync(supportTicket, $"Assigned to Technician: {technicianName}");
    }

    public async Task UpdateTicketStatusAsync(Guid supportTicketId, TicketStatus status)
    {
        var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        var previousStatus = supportTicket.Status;
        supportTicket.Status = status;
        await _supportTicketRepository.UpdateAsync(supportTicket);

        // Send email notification about status change
        await SendStatusUpdateEmailAsync(supportTicket, previousStatus.ToString(), status.ToString());
    }

    public async Task UpdateTicketPriorityAsync(Guid supportTicketId, TicketPriority priority)
    {
        var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        var previousPriority = supportTicket.Priority?.ToString() ?? "Not Set";
        supportTicket.Priority = priority;
        await _supportTicketRepository.UpdateAsync(supportTicket);

        // Send email notification about priority change
        await SendPriorityUpdateEmailAsync(supportTicket, previousPriority, priority.ToString());
    }

    // public async Task AddCommentToTicketAsync(Guid supportTicketId, string comment, Guid userId)
    // {
    //     var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
    //     if (supportTicket == null)
    //     {
    //         throw new UserFriendlyException("Support ticket not found.");
    //     }
    //
    //     await _ticketCommentManager.CreateTicketCommentAsync(new TicketComment(
    //         _guidGenerator.Create(),
    //         supportTicketId,
    //         userId,
    //         comment,
    //         DateTime.UtcNow
    //     ));
    //     
    //     var ticketComment = await _ticketCommentManager.GetTicketCommentAsync(supportTicketId);
    //
    //     supportTicket.TicketComments ??= new List<TicketComment>();
    //     supportTicket.TicketComments.Add(ticketComment);
    //
    //     await _supportTicketRepository.UpdateAsync(supportTicket);
    //
    //     // Notify the user about the new comment
    // }

    public async Task NotifyUserOnTicketUpdateAsync(Guid supportTicketId, UpdateType updateType)
    {
        // This method is kept for interface compatibility but actual notifications
        // are handled by the specific update methods (UpdateTicketStatusAsync, 
        // UpdateTicketPriorityAsync, AssignSupportAgentAsync, AssignTechnicianAsync)
        await Task.CompletedTask;
    }

    // public async Task RemoveCommentFromTicketAsync(Guid supportTicketId, Guid ticketCommentId)
    // {
    //     var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
    //     if (supportTicket == null)
    //     {
    //         throw new UserFriendlyException("Support ticket not found.");
    //     }
    //
    //     var ticketComment = supportTicket.TicketComments?.FirstOrDefault(c => c.Id == ticketCommentId);
    //     if (ticketComment == null)
    //     {
    //         throw new UserFriendlyException("Ticket comment not found.");
    //     }
    //
    //     if (supportTicket.TicketComments != null)
    //     {
    //         supportTicket.TicketComments.Remove(ticketComment);
    //     }
    //     else
    //     {
    //         throw new UserFriendlyException("This Ticket has no comments.");
    //     }
    //
    //     await _supportTicketRepository.UpdateAsync(supportTicket);
    //
    //     // Notify the user about the comment removal
    // }

    #endregion

    #region Private Email Methods

    private async Task SendStatusUpdateEmailAsync(SupportTicket ticket, string previousStatus, string newStatus)
    {
        try
        {
            var appUser = await _appUserRepository.GetAsync(ticket.AppUserId);
            var identityUser = await _identityUserRepository.GetAsync(appUser.IdentityUserId);
            
            await _emailManager.SendTicketUpdatedEmailAsync(
                identityUser.Email, 
                ticket.Id, 
                identityUser.Id, 
                UpdateType.StatusChange, 
                previousStatus, 
                newStatus
            );
        }
        catch (Exception ex)
        {
            // Log error but don't throw - email failure shouldn't break the status update
            _logger.LogError(ex, "Failed to send status update email for ticket {TicketId}", ticket.Id);
        }
    }

    private async Task SendPriorityUpdateEmailAsync(SupportTicket ticket, string previousPriority, string newPriority)
    {
        try
        {
            var appUser = await _appUserRepository.GetAsync(ticket.AppUserId);
            var identityUser = await _identityUserRepository.GetAsync(appUser.IdentityUserId);
            
            await _emailManager.SendTicketUpdatedEmailAsync(
                identityUser.Email, 
                ticket.Id, 
                identityUser.Id, 
                UpdateType.PriorityChange, 
                previousPriority, 
                newPriority
            );
        }
        catch (Exception ex)
        {
            // Log error but don't throw - email failure shouldn't break the priority update
            _logger.LogError(ex, "Failed to send priority update email for ticket {TicketId}", ticket.Id);
        }
    }

    private async Task SendAssignmentUpdateEmailAsync(SupportTicket ticket, string assignmentDescription)
    {
        try
        {
            _logger.LogInformation("Starting to send assignment update email for ticket {TicketId} with description: {AssignmentDescription}", 
                ticket.Id, assignmentDescription);
            
            var appUser = await _appUserRepository.GetAsync(ticket.AppUserId);
            var identityUser = await _identityUserRepository.GetAsync(appUser.IdentityUserId);
            
            _logger.LogInformation("Retrieved user data for assignment email - AppUser: {AppUserId}, IdentityUser: {IdentityUserId}, Email: {Email}", 
                appUser.Id, identityUser.Id, identityUser.Email);
            
            await _emailManager.SendTicketUpdatedEmailAsync(
                identityUser.Email, 
                ticket.Id, 
                identityUser.Id, 
                UpdateType.AssignmentChange, 
                "Unassigned", 
                assignmentDescription
            );
            
            _logger.LogInformation("Successfully sent assignment update email for ticket {TicketId}", ticket.Id);
        }
        catch (Exception ex)
        {
            // Log error but don't throw - email failure shouldn't break the assignment
            _logger.LogError(ex, "Failed to send assignment update email for ticket {TicketId}. Error: {ErrorMessage}", 
                ticket.Id, ex.Message);
        }
    }

    #endregion
}