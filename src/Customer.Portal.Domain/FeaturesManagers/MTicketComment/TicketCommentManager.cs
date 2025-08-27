using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;
using Volo.Abp.Identity;

namespace Customer.Portal.FeaturesManagers.MTicketComment;

public class TicketCommentManager : DomainService, ITicketCommentManager
{

    #region Feilds

    private readonly IRepository<TicketComment, Guid> _ticketCommentRepository;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IGuidGenerator _guidGenerator;

    #endregion

    #region Ctor

    public TicketCommentManager(IRepository<TicketComment, Guid> ticketCommentRepository, IRepository<AppUser, Guid> appUserRepository, IRepository<IdentityUser, Guid> identityUserRepository, IGuidGenerator guidGenerator)
    {
        _ticketCommentRepository = ticketCommentRepository;
        _appUserRepository = appUserRepository;
        _identityUserRepository = identityUserRepository;
        _guidGenerator = guidGenerator;
    }

    #endregion

    #region Methods

    public async Task CreateTicketCommentAsync(TicketComment input)
    { 
        await _ticketCommentRepository.InsertAsync(input);
    }
    
    
    public async Task DeleteTicketCommentAsync(Guid id)
    {
        var entity = await _ticketCommentRepository.GetAsync(id);
        if (entity == null)
        {
            throw new Exception("Ticket Comment not found");
        }
        else
        {
            await _ticketCommentRepository.DeleteAsync(entity);
        }
    }

    public async Task<TicketComment> GetTicketCommentAsync(Guid id)
    {
        return await _ticketCommentRepository.GetAsync(id);
    }

    public async Task<List<TicketComment>> GetTicketCommentsAsync(Guid supportTicketId)
    {
        return await _ticketCommentRepository.GetListAsync(x => x.TicketId == supportTicketId);
    }

    #endregion
    
}