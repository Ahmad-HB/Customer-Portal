using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Microsoft.EntityFrameworkCore;
using Volo.Abp;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;
using Volo.Abp.Identity;


namespace Customer.Portal.FeaturesManagers.MSupportTicket;

public class SupportTicketManager : DomainService, ISupportTicketManager
{
    #region Fields

    private readonly IRepository<SupportTicket, Guid> _supportTicketRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IRepository<IdentityRole, Guid> _identityRoleRepository;
    private readonly IRepository<IdentityUserRole> _identityUserRoleRepository;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IGuidGenerator _guidGenerator;

    #endregion

    #region Ctor

    public SupportTicketManager(IRepository<SupportTicket, Guid> supportTicketRepository,
        IRepository<IdentityUser, Guid> userRepository, IGuidGenerator guidGenerator,
        IRepository<IdentityRole, Guid> identityRoleRepository,
        IRepository<IdentityUserRole> identityUserRoleRepository, IRepository<AppUser, Guid> appUserRepository)
    {
        _supportTicketRepository = supportTicketRepository;
        _identityUserRepository = userRepository;
        _guidGenerator = guidGenerator;
        _identityRoleRepository = identityRoleRepository;
        _identityUserRoleRepository = identityUserRoleRepository;
        _appUserRepository = appUserRepository;
    }

    #endregion
    
    #region Methods

    public async Task CreateSupportTicketAsync(SupportTicket supportTicket, Guid identityUserId)
    {
        var query = await _identityUserRepository.GetQueryableAsync();
        var identityUser = await _identityUserRepository.GetAsync(identityUserId);

        var appUserId = await query
            .Where(u => u.Id == identityUserId)
            .Select(u => EF.Property<Guid>(u, "AppUserId"))
            .FirstOrDefaultAsync();

        supportTicket.AppUserId = appUserId;
        supportTicket.Status = TicketStatus.Open;
        supportTicket.CreatedAt = DateTime.UtcNow;

        await _supportTicketRepository.InsertAsync(supportTicket);

        // Send notification to support team about the new ticket

        await AssignSupportAgentAsync(supportTicket.Id);
    }

    public async Task<SupportTicket> GetSupportTicketByIdAsync(Guid supportTicketId)
    {
        var query = await _supportTicketRepository.GetQueryableAsync();
        var supportTicket = await AsyncExecuter.FirstOrDefaultAsync(query
            .Where(s => s.Id == supportTicketId)
            .Include(x => x.Supportagent)
            .Include(x => x.AppUserId)
            .Include(x => x.Technician)
            .Include(x => x.TicketComments));
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

        if (appUser.UserType == UserType.Admin)
        {
            return await _supportTicketRepository.GetListAsync();
        }
        if (appUser.UserType == UserType.Technician)
        {
            return await _supportTicketRepository.GetListAsync(x => x.TechnicianId == appUserId);
        }
        
        if (appUser.UserType == UserType.SupportAgent)
        {
            return await _supportTicketRepository.GetListAsync(x => x.SupportagentId == appUserId);
        }
        else
        {
            return await _supportTicketRepository.GetListAsync(x => x.AppUserId == appUserId);
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

    public async Task AssignSupportAgentAsync(Guid supportTicketId)
    {
        var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
        var query = await _appUserRepository.GetQueryableAsync();
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        var availableAgents = await AsyncExecuter.ToListAsync(
            query.Where(x => x.UserType == UserType.SupportAgent && x.IsActive));

        if (availableAgents == null)
        {
            throw new UserFriendlyException("No available support agents at the moment.");
        }

        var random = new Random();
        var availableAgent = availableAgents.OrderBy(x => random.Next()).FirstOrDefault();

        if (availableAgent != null)
        {
            supportTicket.SupportagentId = availableAgent.Id;
        }
        else
        {
            throw new UserFriendlyException("No available support agent found.");
        }

        await _supportTicketRepository.UpdateAsync(supportTicket);

        // Notify the assigned agent about the new ticket assignment

        await UpdateTicketStatusAsync(supportTicket.Id, TicketStatus.Closed);
    }

    public async Task AssignTechnicianAsync(Guid supportTicketId, Guid technicianId)
    {
        var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
        var technician = await _appUserRepository.GetAsync(x => x.IdentityUserId == technicianId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        if (technician == null || technician.UserType != UserType.Technician)
        {
            throw new UserFriendlyException("Invalid technician.");
        }

        supportTicket.TechnicianId = technicianId;
        await _supportTicketRepository.UpdateAsync(supportTicket);

        // Notify the assigned technician about the new ticket assignment
    }

    public async Task UpdateTicketStatusAsync(Guid supportTicketId, TicketStatus status)
    {
        var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        supportTicket.Status = status;
        await _supportTicketRepository.UpdateAsync(supportTicket);

        // Notify the user about the status update
    }

    public async Task UpdateTicketPriorityAsync(Guid supportTicketId, TicketPriority priority)
    {
        var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        supportTicket.Priority = priority;
        await _supportTicketRepository.UpdateAsync(supportTicket);

        // Notify the user about the priority update
    }

    public async Task AddCommentToTicketAsync(Guid supportTicketId, string comment, Guid userId)
    {
        var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        var ticketComment = new TicketComment(_guidGenerator.Create(),supportTicketId, userId, comment, DateTime.Now);

        supportTicket.TicketComments ??= new List<TicketComment>();
        supportTicket.TicketComments.Add(ticketComment);

        await _supportTicketRepository.UpdateAsync(supportTicket);

        // Notify the user about the new comment
    }

    public async Task NotifyUserOnTicketUpdateAsync(Guid supportTicketId, UpdateType updateType)
    {
        throw new NotImplementedException();
    }

    public async Task RemoveCommentFromTicketAsync(Guid supportTicketId, Guid ticketCommentId)
    {
        var supportTicket = await _supportTicketRepository.GetAsync(supportTicketId);
        if (supportTicket == null)
        {
            throw new UserFriendlyException("Support ticket not found.");
        }

        var ticketComment = supportTicket.TicketComments?.FirstOrDefault(c => c.Id == ticketCommentId);
        if (ticketComment == null)
        {
            throw new UserFriendlyException("Ticket comment not found.");
        }

        if (supportTicket.TicketComments != null)
        {
            supportTicket.TicketComments.Remove(ticketComment);
        }
        else
        {
            throw new UserFriendlyException("This Ticket has no comments.");
        }
        await _supportTicketRepository.UpdateAsync(supportTicket);

        // Notify the user about the comment removal
    }

    #endregion
}